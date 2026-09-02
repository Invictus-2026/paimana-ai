"""Initial database schema.

Revision ID: 0001_initial_schema
Revises: 
Create Date: 2026-09-02 19:50:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '0001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Projects table
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('start_date', sa.Date(), nullable=True),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('budget', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_projects_id'), 'projects', ['id'], unique=False)
    op.create_index(op.f('ix_projects_name'), 'projects', ['name'], unique=False)

    # Project updates table
    op.create_table(
        'project_updates',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('cost_actual', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('schedule_variance', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status_text', sa.Text(), nullable=True),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_updates_id'), 'project_updates', ['id'], unique=False)
    op.create_index(op.f('ix_project_updates_timestamp'), 'project_updates', ['timestamp'], unique=False)

    # Milestones table
    op.create_table(
        'milestones',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('planned_date', sa.Date(), nullable=True),
        sa.Column('actual_date', sa.Date(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_milestones_id'), 'milestones', ['id'], unique=False)

    # Cost records table
    op.create_table(
        'cost_records',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('cost_category', sa.String(length=100), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('is_synthetic', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cost_records_id'), 'cost_records', ['id'], unique=False)

    # Risk predictions table
    op.create_table(
        'risk_predictions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('cost_risk_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('delay_risk_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('model_version', sa.String(length=100), nullable=False),
        sa.Column('prediction_timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_risk_predictions_id'), 'risk_predictions', ['id'], unique=False)
    op.create_index(op.f('ix_risk_predictions_timestamp'), 'risk_predictions', ['timestamp'], unique=False)

    # Risk factors table
    op.create_table(
        'risk_factors',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('prediction_id', sa.Integer(), nullable=False),
        sa.Column('factor_name', sa.String(length=100), nullable=False),
        sa.Column('factor_value', sa.Float(), nullable=False),
        sa.Column('shap_value', sa.Float(), nullable=False),
        sa.ForeignKeyConstraint(['prediction_id'], ['risk_predictions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_risk_factors_id'), 'risk_factors', ['id'], unique=False)

    # Alerts table
    op.create_table(
        'alerts',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('severity', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('alert_type', sa.String(length=100), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('is_resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_alerts_id'), 'alerts', ['id'], unique=False)
    op.create_index(op.f('ix_alerts_timestamp'), 'alerts', ['timestamp'], unique=False)

    # Model versions table
    op.create_table(
        'model_versions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('model_name', sa.String(length=100), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('training_timestamp', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.Column('deployment_timestamp', sa.DateTime(), nullable=True),
        sa.Column('metrics', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_model_versions_id'), 'model_versions', ['id'], unique=False)

    # Interventions table
    op.create_table(
        'interventions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('risk_prediction_id', sa.Integer(), nullable=True),
        sa.Column('intervention_type', sa.String(length=100), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='proposed'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('CURRENT_TIMESTAMP')),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['risk_prediction_id'], ['risk_predictions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_interventions_id'), 'interventions', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('interventions')
    op.drop_table('model_versions')
    op.drop_table('alerts')
    op.drop_table('risk_factors')
    op.drop_table('risk_predictions')
    op.drop_table('cost_records')
    op.drop_table('milestones')
    op.drop_table('project_updates')
    op.drop_table('projects')
