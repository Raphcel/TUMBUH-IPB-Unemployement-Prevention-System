import logging
from datetime import datetime, timedelta, timezone

import bcrypt as _bcrypt
from jose import jwt, JWTError
from fastapi import HTTPException, status

from app.config.settings import get_settings
from app.domain.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse, TokenResponse

logger = logging.getLogger(__name__)

settings = get_settings()


class AuthService:
    """Service handling authentication and authorization logic."""

    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo

    # ── Password Utilities ───────────────────────────────────

    @staticmethod
    def hash_password(password: str) -> str:
        return _bcrypt.hashpw(password.encode("utf-8"), _bcrypt.gensalt()).decode("utf-8")

    @staticmethod
    def verify_password(plain: str, hashed: str) -> bool:
        return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

    # ── Token Utilities ──────────────────────────────────────

    @staticmethod
    def create_access_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_token(token: str) -> dict:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    # ── Business Methods ─────────────────────────────────────

    def register(self, data: UserCreate) -> TokenResponse:
        """Register a new user and return access + refresh tokens."""
        existing = self._user_repo.get_by_email(data.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists",
            )

        user_dict = data.model_dump(exclude={"password"})
        user_dict["hashed_password"] = self.hash_password(data.password)

        user = self._user_repo.create(user_dict)
        token_data = {"sub": str(user.id), "role": user.role.value}
        access_token = self.create_access_token(token_data)
        refresh_token = self.create_refresh_token(token_data)

        logger.info("User registered: %s (role=%s)", user.email, user.role.value)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def login(self, email: str, password: str) -> TokenResponse:
        """Authenticate a user and return access + refresh tokens."""
        user = self._user_repo.get_by_email(email)
        if not user or not self.verify_password(password, user.hashed_password):
            logger.warning("Failed login attempt for email: %s", email)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
            )

        if not user.is_active:
            logger.warning("Deactivated user login attempt: %s", email)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        token_data = {"sub": str(user.id), "role": user.role.value}
        access_token = self.create_access_token(token_data)
        refresh_token = self.create_refresh_token(token_data)

        logger.info("User logged in: %s", user.email)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=UserResponse.model_validate(user),
        )

    def refresh(self, refresh_token: str) -> TokenResponse:
        """Issue new tokens using a valid refresh token."""
        payload = self.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = self._user_repo.get_by_id(int(user_id))
        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or deactivated")

        token_data = {"sub": str(user.id), "role": user.role.value}
        new_access = self.create_access_token(token_data)
        new_refresh = self.create_refresh_token(token_data)

        return TokenResponse(
            access_token=new_access,
            refresh_token=new_refresh,
            user=UserResponse.model_validate(user),
        )

    def get_current_user(self, token: str) -> User:
        """Decode token and return the associated user."""
        payload = self.decode_token(token)
        if payload.get("type") == "refresh":
            raise HTTPException(status_code=401, detail="Cannot use refresh token for authentication")

        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = self._user_repo.get_by_id(int(user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")
        return user
