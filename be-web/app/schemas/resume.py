from datetime import datetime

from pydantic import BaseModel, Field


class ResumeLinkItem(BaseModel):
    label: str = ""
    url: str = ""


class ResumeExperienceItem(BaseModel):
    role: str = ""
    organization: str = ""
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    organization_description: str = ""
    achievements: list[str] = Field(default_factory=list)


class ResumeProjectItem(BaseModel):
    name: str = ""
    role: str = ""
    link: str = ""
    description: str = ""


class ResumeEducationItem(BaseModel):
    institution: str = ""
    degree: str = ""
    major: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""
    description: str = ""


class ResumeOrganizationItem(BaseModel):
    name: str = ""
    role: str = ""
    start_date: str = ""
    end_date: str = ""
    description: str = ""


class ResumeCertificationItem(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""
    link: str = ""


class ResumeAwardItem(BaseModel):
    name: str = ""
    issuer: str = ""
    year: str = ""
    description: str = ""


class ResumeLanguageItem(BaseModel):
    name: str = ""
    proficiency: str = ""


class ResumePersonalInfo(BaseModel):
    full_name: str = ""
    headline: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    show_photo: bool = True
    links: list[ResumeLinkItem] = Field(default_factory=list)


class ResumeProfessionalInfo(BaseModel):
    summary: str = ""
    experiences: list[ResumeExperienceItem] = Field(default_factory=list)
    projects: list[ResumeProjectItem] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list)


class ResumeEducationInfo(BaseModel):
    educations: list[ResumeEducationItem] = Field(default_factory=list)


class ResumeOrganisationalInfo(BaseModel):
    organizations: list[ResumeOrganizationItem] = Field(default_factory=list)


class ResumeOtherInfo(BaseModel):
    certifications: list[ResumeCertificationItem] = Field(default_factory=list)
    awards: list[ResumeAwardItem] = Field(default_factory=list)
    languages: list[ResumeLanguageItem] = Field(default_factory=list)
    interests: list[str] = Field(default_factory=list)


class ResumeProfileBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    template_slug: str = Field(default="classic", max_length=50)
    personal_info: ResumePersonalInfo = Field(default_factory=ResumePersonalInfo)
    professional_info: ResumeProfessionalInfo = Field(default_factory=ResumeProfessionalInfo)
    education_info: ResumeEducationInfo = Field(default_factory=ResumeEducationInfo)
    organisational_info: ResumeOrganisationalInfo = Field(default_factory=ResumeOrganisationalInfo)
    other_info: ResumeOtherInfo = Field(default_factory=ResumeOtherInfo)


class ResumeProfileCreate(ResumeProfileBase):
    title: str = Field(default="CV Draft 1", min_length=1, max_length=120)


class ResumeProfileUpdate(ResumeProfileBase):
    pass


class ResumeProfileResponse(ResumeProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
