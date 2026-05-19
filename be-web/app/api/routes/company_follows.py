from fastapi import APIRouter, Depends, Query

from app.domain.models.user import User
from app.services.company_follow_service import CompanyFollowService
from app.schemas.company_follow import (
    CompanyFollowListResponse,
    CompanyFollowResponse,
    CompanyFollowStatusResponse,
)
from app.api.dependencies import get_company_follow_service, require_role

router = APIRouter(prefix="/company-follows", tags=["Company Follows"])


@router.get("/", response_model=CompanyFollowListResponse)
def list_followed_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_role("student")),
    company_follow_service: CompanyFollowService = Depends(get_company_follow_service),
):
    return company_follow_service.list_followed_companies(current_user.id, skip, limit)


@router.post("/{company_id}", response_model=CompanyFollowResponse, status_code=201)
def follow_company(
    company_id: int,
    current_user: User = Depends(require_role("student")),
    company_follow_service: CompanyFollowService = Depends(get_company_follow_service),
):
    return company_follow_service.follow_company(current_user.id, company_id)


@router.delete("/{company_id}", status_code=204)
def unfollow_company(
    company_id: int,
    current_user: User = Depends(require_role("student")),
    company_follow_service: CompanyFollowService = Depends(get_company_follow_service),
):
    company_follow_service.unfollow_company(current_user.id, company_id)


@router.get("/{company_id}/status", response_model=CompanyFollowStatusResponse)
def company_follow_status(
    company_id: int,
    current_user: User = Depends(require_role("student")),
    company_follow_service: CompanyFollowService = Depends(get_company_follow_service),
):
    return {"is_following": company_follow_service.is_following(current_user.id, company_id)}
