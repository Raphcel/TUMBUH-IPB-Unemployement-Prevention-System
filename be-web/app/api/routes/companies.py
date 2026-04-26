from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.domain.models.user import User
from app.services.company_service import CompanyService
from app.schemas.company import (
    CompanyCreate, CompanyUpdate, CompanyResponse, CompanyListResponse,
)
from app.api.dependencies import get_company_service, require_role

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("/", response_model=CompanyListResponse)
def list_companies(
    search: str | None = Query(None, description="Search by name or industry"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    company_service: CompanyService = Depends(get_company_service),
):
    """List all companies or search by name/industry."""
    if search:
        return company_service.search_companies(search, skip, limit)
    return company_service.list_companies(skip, limit)


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    company_service: CompanyService = Depends(get_company_service),
):
    """Get a single company by ID."""
    return company_service.get_company(company_id)


@router.post("/", response_model=CompanyResponse, status_code=201)
def create_company(
    data: CompanyCreate,
    current_user: User = Depends(require_role("hr")),
    company_service: CompanyService = Depends(get_company_service),
):
    """Create a new company (HR only)."""
    return company_service.create_company(data)


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    data: CompanyUpdate,
    current_user: User = Depends(require_role("hr")),
    company_service: CompanyService = Depends(get_company_service),
):
    """Update company details (HR only, own company)."""
    if current_user.company_id != company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own company")
    return company_service.update_company(company_id, data)


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    current_user: User = Depends(require_role("hr")),
    company_service: CompanyService = Depends(get_company_service),
):
    """Delete a company (HR only, own company)."""
    if current_user.company_id != company_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only delete your own company")
    return company_service.delete_company(company_id)
