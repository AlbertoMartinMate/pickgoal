"""add status to jornada_matches

Revision ID: 2cce3a287f10
Revises: 59bb97d507d2
Create Date: 2026-08-12 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '2cce3a287f10'
down_revision = 'acaeeb78560a'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('jornada_matches') as batch_op:
        batch_op.add_column(sa.Column(
            'status',
            sa.String(10),
            nullable=False,
            server_default='scheduled',
        ))


def downgrade():
    with op.batch_alter_table('jornada_matches') as batch_op:
        batch_op.drop_column('status')
