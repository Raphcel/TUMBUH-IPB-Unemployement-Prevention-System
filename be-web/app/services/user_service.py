from fastapi import HTTPException, status

from app.domain.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate, UserResponse
from app.services.audit_service import audit_log
from app.services.user_asset_service import (
    ensure_asset_in_managed_location,
    is_managed_avatar_url,
    is_managed_cv_url,
)


class UserService:
    """Service handling user profile business logic."""

    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo

    def get_profile(self, user_id: int) -> UserResponse:
        """Get a user's profile by ID."""
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return self._to_response(user)

    def update_profile(self, user_id: int, data: UserUpdate) -> UserResponse:
        """Update a user's profile."""
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        updated = self._user_repo.update(user, data.model_dump(exclude_unset=True))

        audit_log(
            "USER_PROFILE_UPDATE",
            user_id=user_id,
            resource="user",
            resource_id=user_id,
            detail=f"User {user_id} updated their profile",
            success=True,
        )

        return self._to_response(updated)

    def list_students(self, skip: int = 0, limit: int = 100) -> list[UserResponse]:
        """List all student users."""
        students = self._user_repo.get_students(skip, limit)
        return [self._to_response(s) for s in students]

    def _to_response(self, user: User) -> UserResponse:
        """Normalize managed asset references before serializing the user."""
        updates: dict[str, str | None] = {}

        if is_managed_avatar_url(user.avatar) and not ensure_asset_in_managed_location("avatar", user.avatar):
            updates["avatar"] = None

        if is_managed_cv_url(user.cv_url) and not ensure_asset_in_managed_location("cv", user.cv_url):
            updates["cv_url"] = None

        if updates:
            user = self._user_repo.update(user, updates)

        return UserResponse.model_validate(user)
