from typing import Generic, TypeVar, Type

from sqlalchemy import text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Abstract base repository implementing common CRUD operations.
    All concrete repositories inherit from this class.
    """

    def __init__(self, model: Type[ModelType], db: Session):
        self._model = model
        self._db = db

    def get_by_id(self, id: int) -> ModelType | None:
        """Retrieve a single record by primary key."""
        return self._db.query(self._model).filter(self._model.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[ModelType]:
        """Retrieve all records with pagination."""
        return self._db.query(self._model).offset(skip).limit(limit).all()

    def count(self) -> int:
        """Count total records."""
        return self._db.query(self._model).count()

    def create(self, obj_data: dict) -> ModelType:
        """Create a new record from a dictionary of attributes."""
        db_obj = self._model(**obj_data)
        self._db.add(db_obj)
        try:
            self._db.commit()
        except IntegrityError as exc:
            self._db.rollback()
            if not self._should_retry_after_sequence_sync(exc):
                raise

            self._sync_primary_key_sequence()
            db_obj = self._model(**obj_data)
            self._db.add(db_obj)
            self._db.commit()

        self._db.refresh(db_obj)
        return db_obj

    def update(self, db_obj: ModelType, update_data: dict) -> ModelType:
        """Update an existing record with new data."""
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        self._db.commit()
        self._db.refresh(db_obj)
        return db_obj

    def delete(self, id: int) -> bool:
        """Delete a record by primary key."""
        obj = self.get_by_id(id)
        if obj:
            self._db.delete(obj)
            self._db.commit()
            return True
        return False

    def _should_retry_after_sequence_sync(self, exc: IntegrityError) -> bool:
        if self._db.bind is None or self._db.bind.dialect.name != "postgresql":
            return False

        message = str(exc.orig).lower() if exc.orig else str(exc).lower()
        return "duplicate key value violates unique constraint" in message and f"{self._model.__tablename__}_pkey" in message

    def _sync_primary_key_sequence(self) -> None:
        table_name = self._model.__tablename__
        sequence_name = self._db.execute(
            text("select pg_get_serial_sequence(:table_name, 'id')"),
            {"table_name": table_name},
        ).scalar()
        if not sequence_name:
            return

        self._db.execute(
            text(
                f"select setval(:sequence_name, coalesce((select max(id) from {table_name}), 1), true)"
            ),
            {"sequence_name": sequence_name},
        )
        self._db.commit()
