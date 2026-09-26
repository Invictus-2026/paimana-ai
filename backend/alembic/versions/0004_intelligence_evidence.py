"""Add immutable evidence and single-use action grants."""
from alembic import op
import sqlalchemy as sa
revision='0004_intelligence_evidence'
down_revision='0003_add_risk_score_method'
branch_labels=None
depends_on=None

def upgrade():
    op.create_table('intelligence_evidence',sa.Column('id',sa.Integer(),primary_key=True),sa.Column('kind',sa.String(40),nullable=False),sa.Column('project_id',sa.Integer(),nullable=True),sa.Column('identity',sa.String(128),nullable=False),sa.Column('payload',sa.Text(),nullable=False),sa.Column('created_at',sa.DateTime(),nullable=False),sa.UniqueConstraint('kind','identity',name='uq_evidence_identity'))
    op.create_index('ix_intelligence_evidence_kind','intelligence_evidence',['kind'])
    op.create_index('ix_intelligence_evidence_project_id','intelligence_evidence',['project_id'])
    op.create_table('intelligence_action_grants',sa.Column('id',sa.String(64),primary_key=True),sa.Column('intervention_id',sa.Integer(),nullable=False),sa.Column('expires',sa.Integer(),nullable=False),sa.Column('consumed_at',sa.DateTime(),nullable=True))

def downgrade():
    op.drop_table('intelligence_action_grants')
    op.drop_index('ix_intelligence_evidence_project_id',table_name='intelligence_evidence')
    op.drop_index('ix_intelligence_evidence_kind',table_name='intelligence_evidence')
    op.drop_table('intelligence_evidence')
