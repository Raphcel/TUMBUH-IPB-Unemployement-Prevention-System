"""add_profile_links_and_skills

Revision ID: f3c28a1e5d4b
Revises: cf91baf1e7a0
Create Date: 2026-05-15 23:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f3c28a1e5d4b"
down_revision: Union[str, None] = "cf91baf1e7a0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("social_links", sa.JSON(), nullable=False, server_default=sa.text("'{}'")),
    )
    op.add_column(
        "users",
        sa.Column("skills", sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )
    op.alter_column("users", "social_links", server_default=None)
    op.alter_column("users", "skills", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "skills")
    op.drop_column("users", "social_links")
