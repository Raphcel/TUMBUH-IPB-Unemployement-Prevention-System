"""add_application_questions

Revision ID: e2b7c9d4a6f1
Revises: d9a8f2c1e7b4
Create Date: 2026-05-31 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e2b7c9d4a6f1"
down_revision: Union[str, None] = "d9a8f2c1e7b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "opportunities",
        sa.Column("application_questions", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
    )
    op.add_column(
        "applications",
        sa.Column("question_answers", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
    )
    op.add_column(
        "application_drafts",
        sa.Column("question_answers", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
    )
    op.alter_column("opportunities", "application_questions", server_default=None)
    op.alter_column("applications", "question_answers", server_default=None)
    op.alter_column("application_drafts", "question_answers", server_default=None)


def downgrade() -> None:
    op.drop_column("application_drafts", "question_answers")
    op.drop_column("applications", "question_answers")
    op.drop_column("opportunities", "application_questions")
