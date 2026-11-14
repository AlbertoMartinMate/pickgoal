"""fix push_subscriptions: unique constraint on endpoint alone

Each physical browser subscription (endpoint) can only belong to one
user. If a user logs out and another logs in on the same device, the
endpoint migrates to the new user_id on subscribe.

Revision ID: a2b3c4d5e6f7
Revises: f1a2b3c4d5e6
Create Date: 2026-11-14 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'a2b3c4d5e6f7'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade():
    # Remove duplicate rows — keep only the latest entry per endpoint
    op.execute("""
        DELETE FROM push_subscriptions
        WHERE id NOT IN (
            SELECT MAX(id) FROM push_subscriptions GROUP BY endpoint
        )
    """)
    # Drop the old (user_id, endpoint) constraint
    op.drop_constraint('uq_push_user_endpoint', 'push_subscriptions', type_='unique')
    # New constraint: endpoint alone must be unique
    op.create_unique_constraint('uq_push_endpoint', 'push_subscriptions', ['endpoint'])


def downgrade():
    op.drop_constraint('uq_push_endpoint', 'push_subscriptions', type_='unique')
    op.create_unique_constraint('uq_push_user_endpoint', 'push_subscriptions', ['user_id', 'endpoint'])
