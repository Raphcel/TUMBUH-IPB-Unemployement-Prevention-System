from fastapi import HTTPException, status

from app.repositories.company_repository import CompanyRepository
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyResponse, CompanyListResponse


class CompanyService:
    """Service handling company business logic."""

    def __init__(self, company_repo: CompanyRepository):
        self._company_repo = company_repo

    def get_company(self, company_id: int) -> CompanyResponse:
        """Get a single company by ID."""
        company = self._company_repo.get_by_id(company_id)
        if not company:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
        return CompanyResponse.model_validate(company)

    def list_companies(self, skip: int = 0, limit: int = 100) -> CompanyListResponse:
        """List all companies with pagination."""
        companies = self._company_repo.get_all(skip, limit)
        total = self._company_repo.count()
        return CompanyListResponse(
            items=[CompanyResponse.model_validate(c) for c in companies],
            total=total,
        )

    def search_companies(self, query: str, skip: int = 0, limit: int = 100) -> CompanyListResponse:
        """Search companies by name or industry."""
        companies = self._company_repo.search(query, skip, limit)
        total = self._company_repo.count_search(query)
        return CompanyListResponse(
            items=[CompanyResponse.model_validate(c) for c in companies],
            total=total,
        )

    def create_company(self, data: CompanyCreate) -> CompanyResponse:
        """Create a new company."""
        existing = self._company_repo.get_by_name(data.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company with this name already exists",
            )
        company = self._company_repo.create(data.model_dump())
        return CompanyResponse.model_validate(company)

    def update_company(self, company_id: int, data: CompanyUpdate) -> CompanyResponse:
        """Update an existing company."""
        company = self._company_repo.get_by_id(company_id)
        if not company:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")

        updated = self._company_repo.update(company, data.model_dump(exclude_unset=True))
        return CompanyResponse.model_validate(updated)

    def delete_company(self, company_id: int) -> dict:
        """Delete a company."""
        success = self._company_repo.delete(company_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Company not found")
        return {"message": "Company deleted successfully"}
