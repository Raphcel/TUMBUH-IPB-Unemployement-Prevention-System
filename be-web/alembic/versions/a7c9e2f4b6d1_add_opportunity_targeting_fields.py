"""add opportunity targeting fields

Revision ID: a7c9e2f4b6d1
Revises: f5b1d8c2a4e7
Create Date: 2026-05-18 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a7c9e2f4b6d1"
down_revision: Union[str, None] = "f5b1d8c2a4e7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "opportunities",
        sa.Column(
            "target_majors",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
    )
    op.add_column(
        "opportunities",
        sa.Column(
            "skill_tags",
            sa.JSON(),
            nullable=False,
            server_default=sa.text("'[]'::json"),
        ),
    )


def downgrade() -> None:
    op.drop_column("opportunities", "skill_tags")
    op.drop_column("opportunities", "target_majors")
