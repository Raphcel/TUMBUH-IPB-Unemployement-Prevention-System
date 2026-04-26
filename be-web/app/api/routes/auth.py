from fastapi import APIRouter, Depends, Request

from app.domain.models.user import User
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin, RefreshRequest, TokenResponse, UserResponse
from app.api.dependencies import get_auth_service, get_current_user
from app.config.limiter import limiter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=201)
@limiter.limit("5/minute")
def register(
    request: Request,
    data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Register a new user account."""
    return auth_service.register(data)


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(
    request: Request,
    data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Authenticate and receive access + refresh tokens."""
    return auth_service.login(data.email, data.password)


@router.post("/refresh", response_model=TokenResponse)
def refresh(
    data: RefreshRequest,
    auth_service: AuthService = Depends(get_auth_service),
):
    """Issue new tokens using a valid refresh token."""
    return auth_service.refresh(data.refresh_token)


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    """Get the currently authenticated user's profile."""
    return current_user
