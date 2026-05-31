"""add_email_verification_and_google_auth

Revision ID: d6a7f4b8c2e9
Revises: b8d2f6a9c3e1
Create Date: 2026-05-31 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d6a7f4b8c2e9"
down_revision: Union[str, None] = "b8d2f6a9c3e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("auth_provider", sa.String(length=30), nullable=False, server_default="password"))
    op.add_column("users", sa.Column("google_sub", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("is_email_verified", sa.Boolean(), nullable=False, server_default=sa.true()))
    op.add_column("users", sa.Column("email_verification_token_hash", sa.String(length=64), nullable=True))
    op.add_column("users", sa.Column("email_verification_sent_at", sa.DateTime(), nullable=True))
    op.create_index(op.f("ix_users_google_sub"), "users", ["google_sub"], unique=True)
    op.create_index(op.f("ix_users_email_verification_token_hash"), "users", ["email_verification_token_hash"], unique=False)
    op.alter_column("users", "auth_provider", server_default=None)
    op.alter_column("users", "is_email_verified", server_default=None)


def downgrade() -> None:
    op.drop_index(op.f("ix_users_email_verification_token_hash"), table_name="users")
    op.drop_index(op.f("ix_users_google_sub"), table_name="users")
    op.drop_column("users", "email_verification_sent_at")
    op.drop_column("users", "email_verification_token_hash")
    op.drop_column("users", "is_email_verified")
    op.drop_column("users", "google_sub")
    op.drop_column("users", "auth_provider")
