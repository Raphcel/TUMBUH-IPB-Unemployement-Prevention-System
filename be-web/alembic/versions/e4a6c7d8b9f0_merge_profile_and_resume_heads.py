"""merge_profile_and_resume_heads

Revision ID: e4a6c7d8b9f0
Revises: f3c28a1e5d4b, c8f8f7d5a1b1
Create Date: 2026-05-16 00:00:00.000000
"""

from typing import Sequence, Union


revision: str = "e4a6c7d8b9f0"
down_revision: Union[str, tuple[str, str], None] = (
    "f3c28a1e5d4b",
    "c8f8f7d5a1b1",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
