from fastapi import HTTPException, status

from app.domain.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate, UserResponse
from app.services.audit_service import audit_log


class UserService:
    """Service handling user profile business logic."""

    def __init__(self, user_repo: UserRepository):
        self._user_repo = user_repo

    def get_profile(self, user_id: int) -> UserResponse:
        """Get a user's profile by ID."""
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        return UserResponse.model_validate(user)

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

        return UserResponse.model_validate(updated)

    def list_students(self, skip: int = 0, limit: int = 100) -> list[UserResponse]:
        """List all student users."""
        students = self._user_repo.get_students(skip, limit)
        return [UserResponse.model_validate(s) for s in students]
