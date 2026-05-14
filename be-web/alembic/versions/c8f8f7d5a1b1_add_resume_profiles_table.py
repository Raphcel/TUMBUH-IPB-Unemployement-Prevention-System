"""add_resume_profiles_table

Revision ID: c8f8f7d5a1b1
Revises: a3f5f7c1d9b2
Create Date: 2026-05-14 08:05:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c8f8f7d5a1b1"
down_revision: Union[str, None] = "a3f5f7c1d9b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "resume_profiles",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("template_slug", sa.String(length=50), nullable=False),
        sa.Column("personal_info", sa.JSON(), nullable=False),
        sa.Column("professional_info", sa.JSON(), nullable=False),
        sa.Column("education_info", sa.JSON(), nullable=False),
        sa.Column("organisational_info", sa.JSON(), nullable=False),
        sa.Column("other_info", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_resume_profiles_id"), "resume_profiles", ["id"], unique=False)
    op.create_index(op.f("ix_resume_profiles_user_id"), "resume_profiles", ["user_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_resume_profiles_user_id"), table_name="resume_profiles")
    op.drop_index(op.f("ix_resume_profiles_id"), table_name="resume_profiles")
    op.drop_table("resume_profiles")
