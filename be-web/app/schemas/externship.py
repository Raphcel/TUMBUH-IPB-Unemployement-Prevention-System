from datetime import datetime
from pydantic import BaseModel, Field

from app.domain.models.externship import ExternshipStatus, ExternshipType


# ── Request Schemas ──────────────────────────────────────────

class ExternshipCreate(BaseModel):
    """Schema for creating an externship entry."""
    title: str = Field(..., max_length=300)
    company: str = Field(..., max_length=200)
    duration: str | None = None
    description: str | None = None
    entry_type: ExternshipType = ExternshipType.EXPERIENCE
    status: ExternshipStatus = ExternshipStatus.ONGOING


class ExternshipUpdate(BaseModel):
    """Schema for updating an externship entry."""
    title: str | None = None
    company: str | None = None
    duration: str | None = None
    description: str | None = None
    entry_type: ExternshipType | None = None
    status: ExternshipStatus | None = None


# ── Response Schemas ─────────────────────────────────────────

class ExternshipResponse(BaseModel):
    """Schema for externship data in API responses."""
    id: int
    student_id: int
    title: str
    company: str
    duration: str | None = None
    description: str | None = None
    entry_type: ExternshipType
    status: ExternshipStatus
    created_at: datetime

    class Config:
        from_attributes = True


class ExternshipListResponse(BaseModel):
    """Paginated externship list response."""
    items: list[ExternshipResponse]
    total: int
