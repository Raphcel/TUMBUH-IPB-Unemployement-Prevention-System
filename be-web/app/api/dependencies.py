"""
Dependency injection module — wires repositories and services per request.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.domain.models.user import User
from app.repositories import (
    UserRepository, CompanyRepository, OpportunityRepository, ApplicationRepository,
    BookmarkRepository, ExternshipRepository, NotificationRepository,
)
from app.services import (
    AuthService, UserService, CompanyService, OpportunityService, ApplicationService,
    BookmarkService, ExternshipService, NotificationService,
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


# ── Repository Factories ─────────────────────────────────────

def get_user_repo(db: Session = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


def get_company_repo(db: Session = Depends(get_db)) -> CompanyRepository:
    return CompanyRepository(db)


def get_opportunity_repo(db: Session = Depends(get_db)) -> OpportunityRepository:
    return OpportunityRepository(db)


def get_application_repo(db: Session = Depends(get_db)) -> ApplicationRepository:
    return ApplicationRepository(db)


def get_bookmark_repo(db: Session = Depends(get_db)) -> BookmarkRepository:
    return BookmarkRepository(db)


def get_externship_repo(db: Session = Depends(get_db)) -> ExternshipRepository:
    return ExternshipRepository(db)


def get_notification_repo(db: Session = Depends(get_db)) -> NotificationRepository:
    return NotificationRepository(db)


# ── Service Factories ────────────────────────────────────────

def get_auth_service(user_repo: UserRepository = Depends(get_user_repo)) -> AuthService:
    return AuthService(user_repo)


def get_user_service(user_repo: UserRepository = Depends(get_user_repo)) -> UserService:
    return UserService(user_repo)


def get_company_service(company_repo: CompanyRepository = Depends(get_company_repo)) -> CompanyService:
    return CompanyService(company_repo)


def get_opportunity_service(
    opportunity_repo: OpportunityRepository = Depends(get_opportunity_repo),
    application_repo: ApplicationRepository = Depends(get_application_repo),
) -> OpportunityService:
    return OpportunityService(opportunity_repo, application_repo)


def get_application_service(
    application_repo: ApplicationRepository = Depends(get_application_repo),
    opportunity_repo: OpportunityRepository = Depends(get_opportunity_repo),
) -> ApplicationService:
    return ApplicationService(application_repo, opportunity_repo)


def get_bookmark_service(
    bookmark_repo: BookmarkRepository = Depends(get_bookmark_repo),
) -> BookmarkService:
    return BookmarkService(bookmark_repo)


def get_externship_service(
    externship_repo: ExternshipRepository = Depends(get_externship_repo),
) -> ExternshipService:
    return ExternshipService(externship_repo)


def get_notification_service(
    notification_repo: NotificationRepository = Depends(get_notification_repo),
) -> NotificationService:
    return NotificationService(notification_repo)


# ── Auth Dependencies ────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    auth_service: AuthService = Depends(get_auth_service),
) -> User:
    """Extract and validate the current user from the JWT token."""
    return auth_service.get_current_user(token)


def require_role(required_role: str):
    """Factory for role-based access control dependency."""

    def _check_role(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role: {required_role}",
            )
        return current_user

    return _check_role
