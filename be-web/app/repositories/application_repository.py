from sqlalchemy.orm import Session, joinedload

from app.domain.models.application import Application, ApplicationDraft, ApplicationStatus
from app.repositories.base import BaseRepository


class ApplicationRepository(BaseRepository[Application]):
    """Repository for Application entity — handles all application data access."""

    def __init__(self, db: Session):
        super().__init__(Application, db)

    def get_by_student(self, student_id: int, skip: int = 0, limit: int = 100) -> list[Application]:
        """Retrieve all applications submitted by a student."""
        from app.domain.models.opportunity import Opportunity
        return (
            self._db.query(Application)
            .options(
                joinedload(Application.opportunity).joinedload(Opportunity.company)
            )
            .filter(Application.student_id == student_id)
            .order_by(Application.applied_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_opportunity(self, opportunity_id: int, skip: int = 0, limit: int = 100) -> list[Application]:
        """Retrieve all applications for a given opportunity."""
        from app.domain.models.opportunity import Opportunity
        return (
            self._db.query(Application)
            .options(
                joinedload(Application.student),
                joinedload(Application.opportunity).joinedload(Opportunity.company),
            )
            .filter(Application.opportunity_id == opportunity_id)
            .order_by(Application.applied_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_student_and_opportunity(self, student_id: int, opportunity_id: int) -> Application | None:
        """Check if a student has already applied to an opportunity."""
        return (
            self._db.query(Application)
            .filter(
                Application.student_id == student_id,
                Application.opportunity_id == opportunity_id,
            )
            .first()
        )

    def get_draft(self, student_id: int, opportunity_id: int) -> ApplicationDraft | None:
        """Retrieve one in-progress draft for a student and opportunity."""
        return (
            self._db.query(ApplicationDraft)
            .options(joinedload(ApplicationDraft.opportunity))
            .filter(
                ApplicationDraft.student_id == student_id,
                ApplicationDraft.opportunity_id == opportunity_id,
            )
            .first()
        )

    def get_drafts_by_student(self, student_id: int) -> list[ApplicationDraft]:
        """Retrieve all in-progress drafts for a student."""
        from app.domain.models.opportunity import Opportunity

        return (
            self._db.query(ApplicationDraft)
            .options(joinedload(ApplicationDraft.opportunity).joinedload(Opportunity.company))
            .filter(ApplicationDraft.student_id == student_id)
            .order_by(ApplicationDraft.updated_at.desc())
            .all()
        )

    def save_draft(
        self,
        student_id: int,
        opportunity_id: int,
        cover_letter: str | None,
        question_answers: dict | None = None,
    ) -> ApplicationDraft:
        """Create or update the student's draft for an opportunity."""
        draft = self.get_draft(student_id, opportunity_id)
        if draft:
            draft.cover_letter = cover_letter
            draft.question_answers = question_answers or {}
        else:
            draft = ApplicationDraft(
                student_id=student_id,
                opportunity_id=opportunity_id,
                cover_letter=cover_letter,
                question_answers=question_answers or {},
            )
            self._db.add(draft)

        self._db.commit()
        self._db.refresh(draft)
        return draft

    def delete_draft(self, student_id: int, opportunity_id: int) -> bool:
        """Delete an in-progress draft for a student and opportunity."""
        draft = self.get_draft(student_id, opportunity_id)
        if not draft:
            return False
        self._db.delete(draft)
        self._db.commit()
        return True

    def count_by_opportunity(self, opportunity_id: int) -> int:
        """Count applications for a given opportunity."""
        return (
            self._db.query(Application)
            .filter(Application.opportunity_id == opportunity_id)
            .count()
        )

    def count_by_status(self, opportunity_id: int, status: ApplicationStatus) -> int:
        """Count applications for an opportunity filtered by status."""
        return (
            self._db.query(Application)
            .filter(
                Application.opportunity_id == opportunity_id,
                Application.status == status,
            )
            .count()
        )

    def count_by_student(self, student_id: int) -> int:
        """Count all applications by a student."""
        return (
            self._db.query(Application)
            .filter(Application.student_id == student_id)
            .count()
        )

    def get_by_ids(self, ids: list[int]) -> list[Application]:
        """Retrieve multiple applications by their IDs."""
        return (
            self._db.query(Application)
            .options(
                joinedload(Application.student),
                joinedload(Application.opportunity),
            )
            .filter(Application.id.in_(ids))
            .all()
        )

    def student_has_application_with_company(self, student_id: int, company_id: int) -> bool:
        """Check whether a student applied to at least one opportunity owned by a company."""
        from app.domain.models.opportunity import Opportunity

        return (
            self._db.query(Application.id)
            .join(Opportunity, Opportunity.id == Application.opportunity_id)
            .filter(
                Application.student_id == student_id,
                Opportunity.company_id == company_id,
            )
            .first()
            is not None
        )

    def get_student_ids_by_opportunity(self, opportunity_id: int) -> set[int]:
        """Return student IDs that already applied to an opportunity."""
        rows = (
            self._db.query(Application.student_id)
            .filter(Application.opportunity_id == opportunity_id)
            .all()
        )
        return {student_id for (student_id,) in rows}
