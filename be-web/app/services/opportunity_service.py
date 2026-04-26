import json

from fastapi import HTTPException, status

from app.domain.models.opportunity import OpportunityType
from app.repositories.opportunity_repository import OpportunityRepository
from app.repositories.application_repository import ApplicationRepository
from app.schemas.opportunity import (
    OpportunityCreate, OpportunityUpdate, OpportunityResponse, OpportunityListResponse,
)


class OpportunityService:
    """Service handling opportunity business logic."""

    def __init__(
        self,
        opportunity_repo: OpportunityRepository,
        application_repo: ApplicationRepository | None = None,
    ):
        self._opportunity_repo = opportunity_repo
        self._application_repo = application_repo

    def verify_ownership(self, opportunity_id: int, company_id: int | None) -> None:
        """Verify the opportunity belongs to the HR user's company."""
        opp = self._opportunity_repo.get_by_id(opportunity_id)
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
        if opp.company_id != company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage your own company's opportunities")

    def get_opportunity(self, opportunity_id: int) -> OpportunityResponse:
        """Get a single opportunity by ID (with company)."""
        opp = self._opportunity_repo.get_by_id_with_company(opportunity_id)
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
        return self._to_response(opp)

    def list_opportunities(
        self,
        query: str | None = None,
        type_filter: OpportunityType | None = None,
        location: str | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> OpportunityListResponse:
        """List and search opportunities with filters."""
        results = self._opportunity_repo.search(query, type_filter, location, skip, limit)
        total = self._opportunity_repo.count_search(query, type_filter, location)
        return OpportunityListResponse(
            items=[self._to_response(o) for o in results],
            total=total,
        )

    def get_by_company(self, company_id: int, skip: int = 0, limit: int = 100) -> OpportunityListResponse:
        """List opportunities for a specific company."""
        results = self._opportunity_repo.get_by_company(company_id, skip, limit)
        total = self._opportunity_repo.count_by_company(company_id)
        return OpportunityListResponse(
            items=[self._to_response(o) for o in results],
            total=total,
        )

    def create_opportunity(self, data: OpportunityCreate) -> OpportunityResponse:
        """Create a new opportunity."""
        opp_dict = data.model_dump()
        if opp_dict.get("requirements"):
            opp_dict["requirements"] = json.dumps(opp_dict["requirements"])
        opp = self._opportunity_repo.create(opp_dict)
        # Re-fetch with eager-loaded relationships to avoid lazy-load errors
        opp = self._opportunity_repo.get_by_id_with_company(opp.id)
        return self._to_response(opp)

    def update_opportunity(self, opportunity_id: int, data: OpportunityUpdate) -> OpportunityResponse:
        """Update an existing opportunity."""
        opp = self._opportunity_repo.get_by_id(opportunity_id)
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")

        update_data = data.model_dump(exclude_unset=True)
        if "requirements" in update_data and update_data["requirements"] is not None:
            update_data["requirements"] = json.dumps(update_data["requirements"])

        updated = self._opportunity_repo.update(opp, update_data)
        # Re-fetch with eager-loaded relationships
        updated = self._opportunity_repo.get_by_id_with_company(updated.id)
        return self._to_response(updated)

    def delete_opportunity(self, opportunity_id: int) -> dict:
        """Delete an opportunity."""
        success = self._opportunity_repo.delete(opportunity_id)
        if not success:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
        return {"message": "Opportunity deleted successfully"}

    # ── Helper ───────────────────────────────────────────────

    @staticmethod
    def _to_response(opp) -> OpportunityResponse:
        """Convert ORM model to response schema."""
        data = OpportunityResponse.model_validate(opp)
        if hasattr(opp, "applications") and opp.applications is not None:
            data.applicants_count = len(opp.applications)
        return data
