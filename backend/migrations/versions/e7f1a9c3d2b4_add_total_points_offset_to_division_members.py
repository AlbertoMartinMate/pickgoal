"""add total_points_offset to division_members (50% carry-over of general points)

Revision ID: e7f1a9c3d2b4
Revises: b8c9d0e1f2a3
Create Date: 2026-11-23 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'e7f1a9c3d2b4'
down_revision = 'b8c9d0e1f2a3'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'division_members',
        sa.Column('total_points_offset', sa.Float(), nullable=False, server_default='0'),
    )


def downgrade():
    op.drop_column('division_members', 'total_points_offset')
