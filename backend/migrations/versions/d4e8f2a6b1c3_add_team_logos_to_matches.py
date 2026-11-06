"""add home_logo / away_logo to matches

Revision ID: d4e8f2a6b1c3
Revises: ce9a473073ef
Create Date: 2026-11-06 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4e8f2a6b1c3'
down_revision = 'ce9a473073ef'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('matches', schema=None) as batch_op:
        batch_op.add_column(sa.Column('home_logo', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('away_logo', sa.String(length=255), nullable=True))


def downgrade():
    with op.batch_alter_table('matches', schema=None) as batch_op:
        batch_op.drop_column('away_logo')
        batch_op.drop_column('home_logo')
