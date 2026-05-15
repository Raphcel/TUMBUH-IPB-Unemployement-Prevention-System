from fastapi import HTTPException, status

from app.repositories.externship_repository import ExternshipRepository
from app.schemas.externship import (
    ExternshipCreate, ExternshipUpdate, ExternshipResponse, ExternshipListResponse,
)
from app.services.audit_service import audit_log


class ExternshipService:
    """Service handling externship business logic."""

    def __init__(self, externship_repo: ExternshipRepository):
        self._externship_repo = externship_repo

    def create_externship(self, student_id: int, data: ExternshipCreate) -> ExternshipResponse:
        """Create a new externship entry for a student."""
        ext_dict = data.model_dump()
        ext_dict["student_id"] = student_id
        externship = self._externship_repo.create(ext_dict)

        audit_log(
            "EXTERNSHIP_CREATE",
            user_id=student_id,
            user_role="student",
            resource="externship",
            resource_id=externship.id,
            detail=f"Student {student_id} created {data.entry_type.value.lower()} entry at '{data.company}'",
            success=True,
        )

        return ExternshipResponse.model_validate(externship)

    def get_student_externships(
        self, student_id: int, skip: int = 0, limit: int = 100
    ) -> ExternshipListResponse:
        """List all externships for a student."""
        externships = self._externship_repo.get_by_student(student_id, skip, limit)
        total = self._externship_repo.count_by_student(student_id)
        return ExternshipListResponse(
            items=[ExternshipResponse.model_validate(e) for e in externships],
            total=total,
        )

    def update_externship(
        self, externship_id: int, student_id: int, data: ExternshipUpdate
    ) -> ExternshipResponse:
        """Update an externship (only owner can edit)."""
        externship = self._externship_repo.get_by_id(externship_id)
        if not externship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Externship not found"
            )
        if externship.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not your externship"
            )

        updated = self._externship_repo.update(externship, data.model_dump(exclude_unset=True))

        audit_log(
            "EXTERNSHIP_UPDATE",
            user_id=student_id,
            user_role="student",
            resource="externship",
            resource_id=externship_id,
            detail=f"Student {student_id} updated externship {externship_id}",
            success=True,
        )

        return ExternshipResponse.model_validate(updated)

    def delete_externship(self, externship_id: int, student_id: int) -> dict:
        """Delete an externship (only owner can delete)."""
        externship = self._externship_repo.get_by_id(externship_id)
        if not externship:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Externship not found"
            )
        if externship.student_id != student_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Not your externship"
            )

        self._externship_repo.delete(externship_id)

        audit_log(
            "EXTERNSHIP_DELETE",
            level="warn",
            user_id=student_id,
            user_role="student",
            resource="externship",
            resource_id=externship_id,
            detail=f"Student {student_id} deleted externship {externship_id}",
            success=True,
        )

        return {"message": "Externship deleted successfully"}
