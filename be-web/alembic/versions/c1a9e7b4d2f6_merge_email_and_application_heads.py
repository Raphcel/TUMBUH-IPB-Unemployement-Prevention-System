"""merge_email_and_application_heads

Revision ID: c1a9e7b4d2f6
Revises: d6a7f4b8c2e9, e2b7c9d4a6f1
Create Date: 2026-05-31 00:00:00.000000
"""

from typing import Sequence, Union


revision: str = "c1a9e7b4d2f6"
down_revision: Union[str, tuple[str, str], None] = (
    "d6a7f4b8c2e9",
    "e2b7c9d4a6f1",
)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
