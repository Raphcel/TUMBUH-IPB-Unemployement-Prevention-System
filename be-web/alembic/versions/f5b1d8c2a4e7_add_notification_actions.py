"""add_notification_actions

Revision ID: f5b1d8c2a4e7
Revises: e4a6c7d8b9f0
Create Date: 2026-05-16 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f5b1d8c2a4e7"
down_revision: Union[str, None] = "e4a6c7d8b9f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("notifications", sa.Column("action_label", sa.String(length=100), nullable=True))
    op.add_column("notifications", sa.Column("action_url", sa.String(length=255), nullable=True))


def downgrade() -> None:
    op.drop_column("notifications", "action_url")
    op.drop_column("notifications", "action_label")
