"""add points_offset to division_members for fase-close carry-over

Revision ID: f1a2b3c4d5e6
Revises: a1b2c3d4e5f6
Create Date: 2026-11-14 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'f1a2b3c4d5e6'
down_revision = 'd4e8f2a6b1c3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'division_members',
        sa.Column('points_offset', sa.Integer(), nullable=False, server_default='0'),
    )


def downgrade():
    op.drop_column('division_members', 'points_offset')
