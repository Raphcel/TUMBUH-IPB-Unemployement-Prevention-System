from fastapi import APIRouter, Depends, Query

from app.domain.models.user import User
from app.services.application_service import ApplicationService
from app.schemas.application import (
    ApplicationCreate, ApplicationStatusUpdate, BulkApplicationStatusUpdate,
    ApplicationResponse, ApplicationListResponse,
)
from app.api.dependencies import (
    get_application_service, get_current_user, require_role,
)

router = APIRouter(prefix="/applications", tags=["Applications"])


# ── Student Endpoints ────────────────────────────────────────

@router.post("/", response_model=ApplicationResponse, status_code=201)
def apply_to_opportunity(
    data: ApplicationCreate,
    current_user: User = Depends(require_role("student")),
    application_service: ApplicationService = Depends(get_application_service),
):
    """Submit an application to an opportunity (student only)."""
    return application_service.apply(current_user.id, data)


@router.get("/me", response_model=ApplicationListResponse)
def my_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_role("student")),
    application_service: ApplicationService = Depends(get_application_service),
):
    """List all applications for the current student."""
    return application_service.get_student_applications(current_user.id, skip, limit)


# ── HR Endpoints ─────────────────────────────────────────────

@router.get("/opportunity/{opportunity_id}", response_model=ApplicationListResponse)
def list_applicants(
    opportunity_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_role("hr")),
    application_service: ApplicationService = Depends(get_application_service),
):
    """List all applicants for a specific opportunity (HR only, own company)."""
    application_service.verify_opportunity_ownership(opportunity_id, current_user.company_id)
    return application_service.get_opportunity_applications(opportunity_id, skip, limit)


@router.patch("/bulk-status", response_model=list[ApplicationResponse])
def bulk_update_status(
    data: BulkApplicationStatusUpdate,
    current_user: User = Depends(require_role("hr")),
    application_service: ApplicationService = Depends(get_application_service),
):
    """Bulk update application statuses (HR only, own company)."""
    return application_service.bulk_update_status(
        data.application_ids, data.status, current_user.company_id
    )


@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    data: ApplicationStatusUpdate,
    current_user: User = Depends(require_role("hr")),
    application_service: ApplicationService = Depends(get_application_service),
):
    """Update an application's status (HR only, own company)."""
    return application_service.update_status(application_id, data, current_user.company_id)
