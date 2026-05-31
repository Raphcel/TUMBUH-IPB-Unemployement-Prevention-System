"""add_application_signatures

Revision ID: 9c2a1e7d4f6b
Revises: d6a7f4b8c2e9
Create Date: 2026-05-31 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "9c2a1e7d4f6b"
down_revision: Union[str, None] = "d6a7f4b8c2e9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("applications", sa.Column("signature_payload", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("digital_signature", sa.Text(), nullable=True))
    op.add_column("applications", sa.Column("signature_algorithm", sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column("applications", "signature_algorithm")
    op.drop_column("applications", "digital_signature")
    op.drop_column("applications", "signature_payload")
