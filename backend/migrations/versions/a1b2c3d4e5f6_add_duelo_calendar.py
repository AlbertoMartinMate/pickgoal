"""add duelo_calendar table for round-robin scheduling

Revision ID: a1b2c3d4e5f6
Revises: c9d5e2f1a3b6
Create Date: 2026-08-13 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a1b2c3d4e5f6'
down_revision = 'c9d5e2f1a3b6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'duelo_calendar',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('league_id', sa.Integer(), nullable=False),
        sa.Column('vuelta', sa.Integer(), nullable=False),
        sa.Column('round_number', sa.Integer(), nullable=False),
        sa.Column('player1_id', sa.Integer(), nullable=False),
        sa.Column('player2_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['league_id'], ['leagues.id']),
        sa.ForeignKeyConstraint(['player1_id'], ['users.id']),
        sa.ForeignKeyConstraint(['player2_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('league_id', 'vuelta', 'round_number', 'player1_id',
                            name='uq_duelo_calendar'),
    )


def downgrade():
    op.drop_table('duelo_calendar')
