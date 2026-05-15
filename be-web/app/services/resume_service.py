from fastapi import HTTPException, status

from app.domain.models.resume import ResumeProfile
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import (
    ResumeProfileCreate,
    ResumeProfileResponse,
    ResumeProfileUpdate,
)
from app.services.audit_service import audit_log


MAX_RESUME_DRAFTS = 2


class ResumeService:
    """Service for structured student CV drafts."""

    def __init__(self, resume_repo: ResumeRepository):
        self._resume_repo = resume_repo

    def list_for_user(self, user_id: int) -> list[ResumeProfileResponse]:
        return [self._to_response(resume) for resume in self._resume_repo.list_by_user(user_id)]

    def create_for_user(self, user_id: int, data: ResumeProfileCreate) -> ResumeProfileResponse:
        if self._resume_repo.count_by_user(user_id) >= MAX_RESUME_DRAFTS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"You can only keep {MAX_RESUME_DRAFTS} CV drafts",
            )

        resume = self._resume_repo.create({
            "user_id": user_id,
            **data.model_dump(),
        })

        audit_log(
            "RESUME_CREATE",
            user_id=user_id,
            resource="resume",
            resource_id=resume.id,
            detail=f"User {user_id} created CV draft {resume.id}",
            success=True,
        )

        return self._to_response(resume)

    def get_for_user(self, user_id: int, resume_id: int) -> ResumeProfileResponse:
        return self._to_response(self._get_owned_resume(user_id, resume_id))

    def update_for_user(
        self,
        user_id: int,
        resume_id: int,
        data: ResumeProfileUpdate,
    ) -> ResumeProfileResponse:
        resume = self._get_owned_resume(user_id, resume_id)
        updated = self._resume_repo.update(resume, data.model_dump())

        audit_log(
            "RESUME_UPDATE",
            user_id=user_id,
            resource="resume",
            resource_id=resume_id,
            detail=f"User {user_id} updated CV draft {resume_id}",
            success=True,
        )

        return self._to_response(updated)

    def delete_for_user(self, user_id: int, resume_id: int) -> None:
        resume = self._get_owned_resume(user_id, resume_id)
        self._resume_repo.delete(resume.id)

        audit_log(
            "RESUME_DELETE",
            user_id=user_id,
            resource="resume",
            resource_id=resume_id,
            detail=f"User {user_id} deleted CV draft {resume_id}",
            success=True,
        )

    def _get_owned_resume(self, user_id: int, resume_id: int) -> ResumeProfile:
        resume = self._resume_repo.get_by_id(resume_id)
        if not resume or resume.user_id != user_id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV draft not found")
        return resume

    @staticmethod
    def _to_response(resume: ResumeProfile) -> ResumeProfileResponse:
        return ResumeProfileResponse.model_validate(resume)
