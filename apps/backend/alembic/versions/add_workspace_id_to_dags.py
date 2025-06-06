"""add workspace_id to dags

Revision ID: add_workspace_id_to_dags
Revises: 
Create Date: 2024-03-19

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_workspace_id_to_dags'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Add workspace_id column
    op.add_column('dags',
        sa.Column('workspace_id', sa.Integer(), nullable=False))
    
    # Create foreign key constraint
    op.create_foreign_key(
        'fk_dags_workspace_id',
        'dags', 'workspaces',
        ['workspace_id'], ['id'],
        ondelete='CASCADE'
    )

def downgrade():
    # Drop foreign key constraint
    op.drop_constraint('fk_dags_workspace_id', 'dags', type_='foreignkey')
    
    # Drop workspace_id column
    op.drop_column('dags', 'workspace_id') 