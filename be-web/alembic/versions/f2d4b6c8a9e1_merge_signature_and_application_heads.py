"""merge_signature_and_application_heads

Revision ID: f2d4b6c8a9e1
Revises: c1a9e7b4d2f6, 9c2a1e7d4f6b
Create Date: 2026-05-31 00:00:00.000000
"""

from typing import Sequence, Union


revision: str = "f2d4b6c8a9e1"
down_revision: Union[str, tuple[str, str], None] = (
    "c1a9e7b4d2f6",
    "9c2a1e7d4f6b",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
