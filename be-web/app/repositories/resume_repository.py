from sqlalchemy.orm import Session

from app.domain.models.resume import ResumeProfile
from app.repositories.base import BaseRepository


class ResumeRepository(BaseRepository[ResumeProfile]):
    """Repository for structured CV drafts."""

    def __init__(self, db: Session):
        super().__init__(ResumeProfile, db)

    def list_by_user(self, user_id: int) -> list[ResumeProfile]:
        return (
            self._db.query(ResumeProfile)
            .filter(ResumeProfile.user_id == user_id)
            .order_by(ResumeProfile.updated_at.desc(), ResumeProfile.id.desc())
            .all()
        )

    def count_by_user(self, user_id: int) -> int:
        return (
            self._db.query(ResumeProfile)
            .filter(ResumeProfile.user_id == user_id)
            .count()
        )
