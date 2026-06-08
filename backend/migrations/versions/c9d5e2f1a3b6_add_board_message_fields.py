"""add league_id, is_pinned and parent_id to board_messages

Revision ID: c9d5e2f1a3b6
Revises: 4fee0f8e6980
Create Date: 2026-06-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c9d5e2f1a3b6'
down_revision = '4fee0f8e6980'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('board_messages', schema=None) as batch_op:
        batch_op.add_column(sa.Column('league_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('parent_id', sa.Integer(), nullable=True))
        batch_op.add_column(sa.Column('is_pinned', sa.Boolean(), nullable=False, server_default='false'))
        batch_op.create_foreign_key('fk_board_league', 'leagues', ['league_id'], ['id'])
        batch_op.create_foreign_key('fk_board_parent', 'board_messages', ['parent_id'], ['id'])


def downgrade():
    with op.batch_alter_table('board_messages', schema=None) as batch_op:
        batch_op.drop_constraint('fk_board_parent', type_='foreignkey')
        batch_op.drop_constraint('fk_board_league', type_='foreignkey')
        batch_op.drop_column('is_pinned')
        batch_op.drop_column('parent_id')
        batch_op.drop_column('league_id')
