"""
Admin service — aggregates data from all repositories for platform-wide oversight.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.repositories.company_repository import CompanyRepository
from app.repositories.opportunity_repository import OpportunityRepository
from app.repositories.application_repository import ApplicationRepository


class AdminService:
    """Service handling admin-specific business logic."""

    def __init__(
        self,
        user_repo: UserRepository,
        company_repo: CompanyRepository,
        opportunity_repo: OpportunityRepository,
        application_repo: ApplicationRepository,
    ):
        self._user_repo = user_repo
        self._company_repo = company_repo
        self._opportunity_repo = opportunity_repo
        self._application_repo = application_repo

    # ── Platform Stats ───────────────────────────────────────

    def get_stats(self) -> dict:
        """Return platform-wide statistics for the admin dashboard."""
        total_users = self._user_repo.count()
        total_companies = self._company_repo.count()
        total_opportunities = self._opportunity_repo.count()
        total_applications = self._application_repo.count()

        # Count by role
        all_users = self._user_repo.get_all(skip=0, limit=100000)
        students = [u for u in all_users if u.role.value == "student"]
        hr_users = [u for u in all_users if u.role.value == "hr"]
        active_users = [u for u in all_users if u.is_active]

        # Count applications by status
        all_apps = self._application_repo.get_all(skip=0, limit=100000)
        status_counts = {}
        for app in all_apps:
            s = app.status.value if hasattr(app.status, "value") else str(app.status)
            status_counts[s] = status_counts.get(s, 0) + 1

        return {
            "total_users": total_users,
            "total_students": len(students),
            "total_hr": len(hr_users),
            "active_users": len(active_users),
            "total_companies": total_companies,
            "total_opportunities": total_opportunities,
            "total_applications": total_applications,
            "application_status_breakdown": status_counts,
        }

    # ── User Management ──────────────────────────────────────

    def list_users(
        self,
        skip: int = 0,
        limit: int = 50,
        role: str | None = None,
        search: str | None = None,
        is_active: bool | None = None,
    ) -> dict:
        """List all users with optional filters."""
        from app.domain.models.user import User

        query = self._user_repo._db.query(User)

        if role:
            query = query.filter(User.role == role)
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if search:
            term = f"%{search}%"
            query = query.filter(
                (User.first_name.ilike(term))
                | (User.last_name.ilike(term))
                | (User.email.ilike(term))
            )

        total = query.count()
        items = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

    def toggle_user_active(self, user_id: int) -> dict:
        """Toggle a user's is_active status."""
        user = self._user_repo.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user.is_active = not user.is_active
        self._user_repo._db.commit()
        self._user_repo._db.refresh(user)
        return {"id": user.id, "is_active": user.is_active}

    def delete_user(self, user_id: int) -> dict:
        """Delete a user permanently."""
        deleted = self._user_repo.delete(user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")
        return {"deleted": True}

    # ── Company Management ───────────────────────────────────

    def list_companies(self, skip: int = 0, limit: int = 50) -> dict:
        """List all companies."""
        from app.domain.models.company import Company

        query = self._company_repo._db.query(Company)
        total = query.count()
        items = query.order_by(Company.created_at.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

    def delete_company(self, company_id: int) -> dict:
        """Delete a company permanently."""
        deleted = self._company_repo.delete(company_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Company not found")
        return {"deleted": True}

    # ── Opportunity Management ───────────────────────────────

    def list_opportunities(self, skip: int = 0, limit: int = 50) -> dict:
        """List all opportunities."""
        from app.domain.models.opportunity import Opportunity

        query = self._opportunity_repo._db.query(Opportunity)
        total = query.count()
        items = query.order_by(Opportunity.created_at.desc()).offset(skip).limit(limit).all()
        return {"items": items, "total": total}

    def delete_opportunity(self, opportunity_id: int) -> dict:
        """Delete an opportunity permanently."""
        deleted = self._opportunity_repo.delete(opportunity_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Opportunity not found")
        return {"deleted": True}
