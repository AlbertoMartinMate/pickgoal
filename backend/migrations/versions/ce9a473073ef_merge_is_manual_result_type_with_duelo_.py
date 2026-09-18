"""merge is_manual result_type with duelo_calendar

Revision ID: ce9a473073ef
Revises: 2cce3a287f10, a1b2c3d4e5f6
Create Date: 2026-09-18 12:59:41.809029

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ce9a473073ef'
down_revision = ('2cce3a287f10', 'a1b2c3d4e5f6')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
