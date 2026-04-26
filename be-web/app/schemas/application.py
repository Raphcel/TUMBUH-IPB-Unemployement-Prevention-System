import json
from datetime import datetime
from pydantic import BaseModel, field_validator

from app.domain.models.application import ApplicationStatus
from app.schemas.opportunity import OpportunityResponse
from app.schemas.user import UserResponse


# ── Nested Schemas ───────────────────────────────────────────

class StatusHistoryItem(BaseModel):
    """Single entry in an application's status history."""
    status: str
    date: str


# ── Request Schemas ──────────────────────────────────────────

class ApplicationCreate(BaseModel):
    """Schema for submitting a new application."""
    opportunity_id: int
    cover_letter: str | None = None


class ApplicationStatusUpdate(BaseModel):
    """Schema for updating an application's status (by HR)."""
    status: ApplicationStatus


class BulkApplicationStatusUpdate(BaseModel):
    """Schema for bulk-updating application statuses (by HR)."""
    application_ids: list[int]
    status: ApplicationStatus


# ── Response Schemas ─────────────────────────────────────────

class ApplicationResponse(BaseModel):
    """Schema for application data in API responses."""
    id: int
    student_id: int
    opportunity_id: int
    status: ApplicationStatus
    applied_at: datetime
    cover_letter: str | None = None
    history: list[StatusHistoryItem] | None = None
    opportunity: OpportunityResponse | None = None
    student: UserResponse | None = None

    @field_validator("history", mode="before")
    @classmethod
    def parse_history_json(cls, v):
        """Deserialize the JSON string stored in the DB into a list."""
        if isinstance(v, str):
            try:
                raw = json.loads(v)
                return [StatusHistoryItem(**h) for h in raw]
            except (json.JSONDecodeError, TypeError):
                return []
        return v

    class Config:
        from_attributes = True


class ApplicationListResponse(BaseModel):
    """Paginated application list response."""
    items: list[ApplicationResponse]
    total: int
