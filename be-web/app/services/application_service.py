import json
from datetime import datetime

from fastapi import HTTPException, status

from app.domain.models.application import ApplicationStatus
from app.repositories.application_repository import ApplicationRepository
from app.schemas.application import (
    ApplicationCreate, ApplicationStatusUpdate,
    ApplicationResponse, ApplicationListResponse, StatusHistoryItem,
)


class ApplicationService:
    """Service handling application business logic."""

    def __init__(self, application_repo: ApplicationRepository):
        self._application_repo = application_repo

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

        now = datetime.utcnow().isoformat()
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
        return ApplicationListResponse(
            items=[self._to_response(a) for a in apps],
            total=len(apps),
        )

    def get_opportunity_applications(
        self, opportunity_id: int, skip: int = 0, limit: int = 100
    ) -> ApplicationListResponse:
        """List all applications for an opportunity (HR view)."""
        apps = self._application_repo.get_by_opportunity(opportunity_id, skip, limit)
        return ApplicationListResponse(
            items=[self._to_response(a) for a in apps],
            total=len(apps),
        )

    def update_status(self, application_id: int, data: ApplicationStatusUpdate) -> ApplicationResponse:
        """Update application status and append to history (HR action)."""
        application = self._application_repo.get_by_id(application_id)
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )

        # Parse existing history and append new status
        history = []
        if application.history:
            try:
                history = json.loads(application.history)
            except json.JSONDecodeError:
                history = []

        history.append({
            "status": data.status.value,
            "date": datetime.utcnow().isoformat(),
        })

        updated = self._application_repo.update(
            application,
            {"status": data.status, "history": json.dumps(history)},
        )
        return self._to_response(updated)

    # ── Helper ───────────────────────────────────────────────

    @staticmethod
    def _to_response(app) -> ApplicationResponse:
        """Convert ORM model to response, deserializing history JSON."""
        response = ApplicationResponse.model_validate(app)
        if isinstance(app.history, str):
            try:
                raw = json.loads(app.history)
                response.history = [StatusHistoryItem(**h) for h in raw]
            except json.JSONDecodeError:
                response.history = []
        return response
