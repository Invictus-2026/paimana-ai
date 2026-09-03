"""Add risk_score_method to projects.

Revision ID: 0003_add_risk_score_method
Revises: 0002_add_real_dataset_columns
Create Date: 2026-09-03 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0003_add_risk_score_method'
down_revision: Union[str, None] = '0002_add_real_dataset_columns'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('risk_score_method', sa.String(length=50), nullable=False, server_default='unscored'))


def downgrade() -> None:
    op.drop_column('projects', 'risk_score_method')
