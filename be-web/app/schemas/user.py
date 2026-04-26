from datetime import datetime, timedelta, timezone

from pydantic import BaseModel, Field, EmailStr

from app.domain.models.user import UserRole


# ── Request Schemas ──────────────────────────────────────────

class UserCreate(BaseModel):
    """Schema for creating a new user (registration)."""
    email: EmailStr = Field(..., examples=["budi@apps.ipb.ac.id"])
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    role: UserRole = UserRole.STUDENT

    # Student-specific (optional)
    nim: str | None = None
    major: str | None = None
    university: str | None = "IPB University"
    gpa: float | None = None

    # HR-specific (optional)
    company_id: int | None = None


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    bio: str | None = None
    nim: str | None = None
    major: str | None = None
    gpa: float | None = None
    avatar: str | None = None
    cv_url: str | None = None


class UserLogin(BaseModel):
    """Schema for login request."""
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    """Schema for token refresh request."""
    refresh_token: str


# ── Response Schemas ─────────────────────────────────────────

class UserResponse(BaseModel):
    """Schema for user data in API responses."""
    id: int
    email: str
    first_name: str
    last_name: str
    role: UserRole
    avatar: str | None = None
    phone: str | None = None
    bio: str | None = None
    nim: str | None = None
    major: str | None = None
    university: str | None = None
    gpa: float | None = None
    cv_url: str | None = None
    company_id: int | None = None
    is_active: bool = True
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse
