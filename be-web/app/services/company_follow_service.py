from fastapi import HTTPException, status

from app.repositories.company_follow_repository import CompanyFollowRepository
from app.repositories.company_repository import CompanyRepository
from app.schemas.company_follow import CompanyFollowListResponse, CompanyFollowResponse


class CompanyFollowService:
    """Service handling student company follows."""

    def __init__(
        self,
        company_follow_repo: CompanyFollowRepository,
        company_repo: CompanyRepository,
    ):
        self._company_follow_repo = company_follow_repo
        self._company_repo = company_repo

    def follow_company(self, student_id: int, company_id: int) -> CompanyFollowResponse:
        self._ensure_company_exists(company_id)
        existing = self._company_follow_repo.get_by_student_and_company(student_id, company_id)
        if existing:
            return CompanyFollowResponse.model_validate(existing)

        follow = self._company_follow_repo.create({
            "student_id": student_id,
            "company_id": company_id,
        })
        return CompanyFollowResponse.model_validate(follow)

    def unfollow_company(self, student_id: int, company_id: int) -> dict:
        self._ensure_company_exists(company_id)
        deleted = self._company_follow_repo.delete_by_student_and_company(student_id, company_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company follow not found",
            )
        return {"message": "Company unfollowed successfully"}

    def list_followed_companies(self, student_id: int, skip: int = 0, limit: int = 100) -> CompanyFollowListResponse:
        follows = self._company_follow_repo.get_by_student(student_id, skip, limit)
        total = self._company_follow_repo.count_by_student(student_id)
        return CompanyFollowListResponse(
            items=[CompanyFollowResponse.model_validate(follow) for follow in follows],
            total=total,
        )

    def is_following(self, student_id: int, company_id: int) -> bool:
        self._ensure_company_exists(company_id)
        return self._company_follow_repo.get_by_student_and_company(student_id, company_id) is not None

    def followed_company_ids(self, student_id: int) -> list[int]:
        return self._company_follow_repo.get_followed_company_ids(student_id)

    def _ensure_company_exists(self, company_id: int) -> None:
        if not self._company_repo.get_by_id(company_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found",
            )
