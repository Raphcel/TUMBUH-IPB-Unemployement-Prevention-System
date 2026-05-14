"""add_admin_to_userrole_enum

Revision ID: a3f5f7c1d9b2
Revises: bd36fd371a3d
Create Date: 2026-05-14 05:55:00.000000
"""

from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = "a3f5f7c1d9b2"
down_revision: Union[str, None] = "bd36fd371a3d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'ADMIN'")


def downgrade() -> None:
    # PostgreSQL enums do not support removing values safely in place.
    pass
