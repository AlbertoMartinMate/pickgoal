"""add user_jornada_stats, fase_results, achievements, user_achievements

Revision ID: b8c9d0e1f2a3
Revises: a2b3c4d5e6f7
Create Date: 2026-11-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b8c9d0e1f2a3'
down_revision = 'a2b3c4d5e6f7'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'user_jornada_stats',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('jornada_id', sa.Integer(), sa.ForeignKey('jornadas.id', ondelete='CASCADE'), nullable=False),
        sa.Column('season_id', sa.Integer(), sa.ForeignKey('seasons.id'), nullable=False),
        sa.Column('fase', sa.Integer(), nullable=False),
        sa.Column('points', sa.Float(), nullable=False, server_default='0'),
        sa.Column('hits', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('matches_counted', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('duel_result', sa.String(1), nullable=True),
        sa.Column('duel_opponent_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('division_league_id', sa.Integer(), sa.ForeignKey('leagues.id', ondelete='SET NULL'), nullable=True),
        sa.Column('division', sa.Integer(), nullable=True),
        sa.Column('is_bot', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.UniqueConstraint('user_id', 'jornada_id', name='uq_user_jornada_stats'),
    )
    op.create_index('ix_user_jornada_stats_user_id', 'user_jornada_stats', ['user_id'])
    op.create_index('ix_user_jornada_stats_jornada_id', 'user_jornada_stats', ['jornada_id'])
    op.create_index('ix_user_jornada_stats_points', 'user_jornada_stats', ['points'])

    op.create_table(
        'fase_results',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('season_id', sa.Integer(), sa.ForeignKey('seasons.id'), nullable=False),
        sa.Column('fase', sa.Integer(), nullable=False),
        sa.Column('last_jornada_number', sa.Integer(), nullable=False),
        sa.Column('league_id', sa.Integer(), sa.ForeignKey('leagues.id', ondelete='SET NULL'), nullable=True),
        sa.Column('division', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('is_bot', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('position', sa.Integer(), nullable=False),
        sa.Column('pts_division', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('pj', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('g', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('e', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('p', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('fase_points', sa.Float(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.UniqueConstraint('season_id', 'fase', 'user_id', name='uq_fase_result'),
    )
    op.create_index('ix_fase_results_user_id', 'fase_results', ['user_id'])

    op.create_table(
        'achievements',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('slug', sa.String(60), nullable=False, unique=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('description', sa.String(255), nullable=False),
        sa.Column('category', sa.String(20), nullable=False),
        sa.Column('icon', sa.String(16), nullable=True),
        sa.Column('threshold', sa.Integer(), nullable=True),
        sa.Column('is_repeatable', sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    op.create_table(
        'user_achievements',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('achievement_id', sa.Integer(), sa.ForeignKey('achievements.id', ondelete='CASCADE'), nullable=False),
        sa.Column('earned_at', sa.DateTime(), nullable=False),
        sa.Column('last_earned_at', sa.DateTime(), nullable=False),
        sa.Column('count', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('context', sa.JSON(), nullable=True),
        sa.UniqueConstraint('user_id', 'achievement_id', name='uq_user_achievement'),
    )
    op.create_index('ix_user_achievements_user_id', 'user_achievements', ['user_id'])


def downgrade():
    op.drop_index('ix_user_achievements_user_id', table_name='user_achievements')
    op.drop_table('user_achievements')
    op.drop_table('achievements')
    op.drop_index('ix_fase_results_user_id', table_name='fase_results')
    op.drop_table('fase_results')
    op.drop_index('ix_user_jornada_stats_points', table_name='user_jornada_stats')
    op.drop_index('ix_user_jornada_stats_jornada_id', table_name='user_jornada_stats')
    op.drop_index('ix_user_jornada_stats_user_id', table_name='user_jornada_stats')
    op.drop_table('user_jornada_stats')
