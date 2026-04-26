import json
from datetime import datetime, timezone

from fastapi import HTTPException, status

from app.domain.models.application import ApplicationStatus
from app.repositories.application_repository import ApplicationRepository
from app.repositories.opportunity_repository import OpportunityRepository
from app.schemas.application import (
    ApplicationCreate, ApplicationStatusUpdate,
    ApplicationResponse, ApplicationListResponse,
)


class ApplicationService:
    """Service handling application business logic."""

    def __init__(
        self,
        application_repo: ApplicationRepository,
        opportunity_repo: OpportunityRepository | None = None,
    ):
        self._application_repo = application_repo
        self._opportunity_repo = opportunity_repo

    def verify_opportunity_ownership(self, opportunity_id: int, company_id: int | None) -> None:
        """Verify the opportunity belongs to the HR user's company."""
        if not self._opportunity_repo:
            raise HTTPException(status_code=500, detail="Internal configuration error")
        opp = self._opportunity_repo.get_by_id(opportunity_id)
        if not opp:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Opportunity not found")
        if opp.company_id != company_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only manage applicants for your own company's opportunities")

    def apply(self, student_id: int, data: ApplicationCreate) -> ApplicationResponse:
        """Submit a new application (student action)."""
        existing = self._application_repo.get_by_student_and_opportunity(
            student_id, data.opportunity_id
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="You already applied to this opportunity",
            )

        now = datetime.now(timezone.utc).isoformat()
        initial_history = json.dumps([{"status": "Applied", "date": now}])

        app_dict = {
            "student_id": student_id,
            "opportunity_id": data.opportunity_id,
            "status": ApplicationStatus.APPLIED,
            "history": initial_history,
        }
        application = self._application_repo.create(app_dict)
        return self._to_response(application)

    def get_student_applications(
        self, student_id: int, skip: int = 0, limit: int = 100
    ) -> ApplicationListResponse:
        """List all applications for a student."""
        apps = self._application_repo.get_by_student(student_id, skip, limit)
        total = self._application_repo.count_by_student(student_id)
        return ApplicationListResponse(
            items=[self._to_response(a) for a in apps],
            total=total,
        )

    def get_opportunity_applications(
        self, opportunity_id: int, skip: int = 0, limit: int = 100
    ) -> ApplicationListResponse:
        """List all applications for an opportunity (HR view)."""
        apps = self._application_repo.get_by_opportunity(opportunity_id, skip, limit)
        total = self._application_repo.count_by_opportunity(opportunity_id)
        return ApplicationListResponse(
            items=[self._to_response(a) for a in apps],
            total=total,
        )

    def update_status(self, application_id: int, data: ApplicationStatusUpdate, company_id: int | None = None) -> ApplicationResponse:
        """Update application status and append to history (HR action)."""
        application = self._application_repo.get_by_id(application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )

        # Verify ownership if company_id provided
        if company_id is not None and self._opportunity_repo:
            opp = self._opportunity_repo.get_by_id(application.opportunity_id)
            if not opp or opp.company_id != company_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only update applications for your own company's opportunities")

        # Parse existing history and append new status
        history = []
        if application.history:
            try:
                history = json.loads(application.history)
            except json.JSONDecodeError:
                history = []

        history.append({
            "status": data.status.value,
            "date": datetime.now(timezone.utc).isoformat(),
        })

        updated = self._application_repo.update(
            application,
            {"status": data.status, "history": json.dumps(history)},
        )
        return self._to_response(updated)

    def bulk_update_status(
        self,
        application_ids: list[int],
        new_status: ApplicationStatus,
        company_id: int | None = None,
    ) -> list[ApplicationResponse]:
        """Bulk update status for multiple applications (HR action)."""
        applications = self._application_repo.get_by_ids(application_ids)

        if len(applications) != len(application_ids):
            found_ids = {a.id for a in applications}
            missing = [aid for aid in application_ids if aid not in found_ids]
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Applications not found: {missing}",
            )

        if company_id is not None and self._opportunity_repo:
            for app in applications:
                opp = self._opportunity_repo.get_by_id(app.opportunity_id)
                if not opp or opp.company_id != company_id:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Application {app.id} does not belong to your company",
                    )

        now = datetime.now(timezone.utc).isoformat()
        results = []
        for app in applications:
            history = []
            if app.history:
                try:
                    history = json.loads(app.history)
                except json.JSONDecodeError:
                    history = []
            history.append({"status": new_status.value, "date": now})

            updated = self._application_repo.update(
                app, {"status": new_status, "history": json.dumps(history)}
            )
            results.append(self._to_response(updated))

        return results

    # ── Helper ───────────────────────────────────────────────

    @staticmethod
    def _to_response(app) -> ApplicationResponse:
        """Convert ORM model to response — history JSON is parsed by the schema validator."""
        return ApplicationResponse.model_validate(app)
