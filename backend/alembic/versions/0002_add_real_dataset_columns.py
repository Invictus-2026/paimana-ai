"""Add revised_cost, cumulative_expenditure, external_project_id to projects.

Revision ID: 0002_add_real_dataset_columns
Revises: 0001_initial_schema
Create Date: 2026-09-03 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0002_add_real_dataset_columns'
down_revision: Union[str, None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('projects', sa.Column('revised_cost', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('projects', sa.Column('cumulative_expenditure', sa.Float(), nullable=False, server_default='0.0'))
    op.add_column('projects', sa.Column('external_project_id', sa.String(length=50), nullable=True))
    op.create_index(op.f('ix_projects_external_project_id'), 'projects', ['external_project_id'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_projects_external_project_id'), table_name='projects')
    op.drop_column('projects', 'external_project_id')
    op.drop_column('projects', 'cumulative_expenditure')
    op.drop_column('projects', 'revised_cost')
