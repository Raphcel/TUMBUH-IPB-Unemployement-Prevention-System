from fastapi import APIRouter, Depends, Response, status

from app.api.dependencies import get_resume_service, require_role
from app.domain.models.user import User
from app.schemas.resume import (
    ResumeProfileCreate,
    ResumeProfileResponse,
    ResumeProfileUpdate,
)
from app.services.resume_service import ResumeService

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.get("/me", response_model=list[ResumeProfileResponse])
def list_my_resumes(
    current_user: User = Depends(require_role("student")),
    resume_service: ResumeService = Depends(get_resume_service),
):
    return resume_service.list_for_user(current_user.id)


@router.post("/me", response_model=ResumeProfileResponse, status_code=status.HTTP_201_CREATED)
def create_my_resume(
    data: ResumeProfileCreate,
    current_user: User = Depends(require_role("student")),
    resume_service: ResumeService = Depends(get_resume_service),
):
    return resume_service.create_for_user(current_user.id, data)


@router.get("/{resume_id}", response_model=ResumeProfileResponse)
def get_my_resume(
    resume_id: int,
    current_user: User = Depends(require_role("student")),
    resume_service: ResumeService = Depends(get_resume_service),
):
    return resume_service.get_for_user(current_user.id, resume_id)


@router.put("/{resume_id}", response_model=ResumeProfileResponse)
def update_my_resume(
    resume_id: int,
    data: ResumeProfileUpdate,
    current_user: User = Depends(require_role("student")),
    resume_service: ResumeService = Depends(get_resume_service),
):
    return resume_service.update_for_user(current_user.id, resume_id, data)


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_my_resume(
    resume_id: int,
    current_user: User = Depends(require_role("student")),
    resume_service: ResumeService = Depends(get_resume_service),
):
    resume_service.delete_for_user(current_user.id, resume_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
