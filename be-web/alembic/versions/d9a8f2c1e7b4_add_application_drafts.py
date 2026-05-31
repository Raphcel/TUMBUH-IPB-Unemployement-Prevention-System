"""add_application_drafts

Revision ID: d9a8f2c1e7b4
Revises: b8d2f6a9c3e1
Create Date: 2026-05-31 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d9a8f2c1e7b4"
down_revision: Union[str, None] = "b8d2f6a9c3e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "application_drafts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("opportunity_id", sa.Integer(), nullable=False),
        sa.Column("cover_letter", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["opportunity_id"], ["opportunities.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "student_id",
            "opportunity_id",
            name="uq_application_draft_student_opportunity",
        ),
    )
    op.create_index(op.f("ix_application_drafts_id"), "application_drafts", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_application_drafts_id"), table_name="application_drafts")
    op.drop_table("application_drafts")
