from sqlalchemy.orm import Session, joinedload

from app.domain.models.company_follow import CompanyFollow
from app.domain.models.user import User, UserRole
from app.repositories.base import BaseRepository


class CompanyFollowRepository(BaseRepository[CompanyFollow]):
    """Repository for company follow data access."""

    def __init__(self, db: Session):
        super().__init__(CompanyFollow, db)

    def get_by_student_and_company(self, student_id: int, company_id: int) -> CompanyFollow | None:
        return (
            self._db.query(CompanyFollow)
            .filter(
                CompanyFollow.student_id == student_id,
                CompanyFollow.company_id == company_id,
            )
            .first()
        )

    def get_by_student(self, student_id: int, skip: int = 0, limit: int = 100) -> list[CompanyFollow]:
        return (
            self._db.query(CompanyFollow)
            .options(joinedload(CompanyFollow.company))
            .filter(CompanyFollow.student_id == student_id)
            .order_by(CompanyFollow.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_student(self, student_id: int) -> int:
        return (
            self._db.query(CompanyFollow)
            .filter(CompanyFollow.student_id == student_id)
            .count()
        )

    def delete_by_student_and_company(self, student_id: int, company_id: int) -> bool:
        follow = self.get_by_student_and_company(student_id, company_id)
        if not follow:
            return False

        self._db.delete(follow)
        self._db.commit()
        return True

    def get_followed_company_ids(self, student_id: int) -> list[int]:
        rows = (
            self._db.query(CompanyFollow.company_id)
            .filter(CompanyFollow.student_id == student_id)
            .all()
        )
        return [company_id for (company_id,) in rows]

    def get_active_student_followers_by_company(self, company_id: int) -> list[User]:
        return (
            self._db.query(User)
            .join(CompanyFollow, CompanyFollow.student_id == User.id)
            .filter(
                CompanyFollow.company_id == company_id,
                User.role == UserRole.STUDENT,
                User.is_active == True,
            )
            .all()
        )
