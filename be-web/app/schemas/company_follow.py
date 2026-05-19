from datetime import datetime

from pydantic import BaseModel

from app.schemas.company import CompanyResponse


class CompanyFollowResponse(BaseModel):
    id: int
    student_id: int
    company_id: int
    created_at: datetime
    company: CompanyResponse | None = None

    class Config:
        from_attributes = True


class CompanyFollowListResponse(BaseModel):
    items: list[CompanyFollowResponse]
    total: int


class CompanyFollowStatusResponse(BaseModel):
    is_following: bool
