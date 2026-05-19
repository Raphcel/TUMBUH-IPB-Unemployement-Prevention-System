"""add company follows

Revision ID: b8d2f6a9c3e1
Revises: a7c9e2f4b6d1
Create Date: 2026-05-18 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b8d2f6a9c3e1"
down_revision: Union[str, None] = "a7c9e2f4b6d1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "company_follows",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("company_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["company_id"], ["companies.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["student_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("student_id", "company_id", name="uq_student_company_follow"),
    )
    op.create_index(op.f("ix_company_follows_id"), "company_follows", ["id"], unique=False)
    op.create_index(op.f("ix_company_follows_student_id"), "company_follows", ["student_id"], unique=False)
    op.create_index(op.f("ix_company_follows_company_id"), "company_follows", ["company_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_company_follows_company_id"), table_name="company_follows")
    op.drop_index(op.f("ix_company_follows_student_id"), table_name="company_follows")
    op.drop_index(op.f("ix_company_follows_id"), table_name="company_follows")
    op.drop_table("company_follows")
