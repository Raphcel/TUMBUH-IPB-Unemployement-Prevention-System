from sqlalchemy.orm import Session

from app.domain.models.user import User, UserRole
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """Repository for User entity — handles all user data access."""

    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_email(self, email: str) -> User | None:
        """Find a user by their email address."""
        return self._db.query(User).filter(User.email == email).first()

    def get_students(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Retrieve all users with student role."""
        return (
            self._db.query(User)
            .filter(User.role == UserRole.STUDENT, User.is_active == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_hr_by_company(self, company_id: int) -> list[User]:
        """Retrieve all HR staff for a given company."""
        return (
            self._db.query(User)
            .filter(User.role == UserRole.HR, User.company_id == company_id, User.is_active == True)
            .all()
        )
