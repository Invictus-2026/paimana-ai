"""Bring clean migration installs into parity with the existing runtime ORM."""
from alembic import op
import sqlalchemy as sa
revision='0005_reconcile_runtime_schema'
down_revision='0004_intelligence_evidence'
branch_labels=None
depends_on=None

COLUMNS={
 'projects': [('sector',sa.String(100),None),('ministry',sa.String(100),None),('state',sa.String(100),None),('overall_risk_score',sa.Float(),'0.0'),('cost_overrun_pct',sa.Float(),'0.0')],
 'risk_predictions':[('overall_risk_score',sa.Float(),'0.0'),('predicted_cost_overrun_pct',sa.Float(),'0.0'),('predicted_delay_days',sa.Float(),'0.0')],
 'model_versions':[('status',sa.String(50),'active')],
}
def upgrade():
    inspector=sa.inspect(op.get_bind())
    for table,columns in COLUMNS.items():
        existing={c['name'] for c in inspector.get_columns(table)}
        for name,kind,default in columns:
            if name not in existing:
                op.add_column(table,sa.Column(name,kind,nullable=default is None,server_default=default))

def downgrade():
    # Preserve data that may pre-date this reconciliation migration.
    pass
