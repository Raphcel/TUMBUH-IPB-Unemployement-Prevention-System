"""add_entry_type_to_externships

Revision ID: cf91baf1e7a0
Revises: a3f5f7c1d9b2
Create Date: 2026-05-15 22:18:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "cf91baf1e7a0"
down_revision: Union[str, None] = "a3f5f7c1d9b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    entry_type = sa.Enum(
        "EXPERIENCE",
        "PROJECT",
        "CERTIFICATION",
        "ORGANIZATION",
        name="externshiptype",
    )
    entry_type.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "externships",
        sa.Column(
            "entry_type",
            entry_type,
            nullable=False,
            server_default="EXPERIENCE",
        ),
    )
    op.alter_column("externships", "entry_type", server_default=None)


def downgrade() -> None:
    op.drop_column("externships", "entry_type")
    sa.Enum(name="externshiptype").drop(op.get_bind(), checkfirst=True)
