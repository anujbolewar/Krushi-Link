"""
Create initial tables for AgroVault
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001_create_tables'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create FPO table
    op.create_table(
        'fpos',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('location', sa.String(255), nullable=False),
    )

    # Create Users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255), unique=True, nullable=False),
        sa.Column('role', sa.String(50), nullable=False),
        sa.Column('fpo_id', sa.Integer, sa.ForeignKey('fpos.id')),
    )

    # Create Lots table
    op.create_table(
        'lots',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('crop_type', sa.String(255), nullable=False),
        sa.Column('quantity', sa.String(50), nullable=False),
        sa.Column('harvest_date', sa.Date, nullable=False),
        sa.Column('location', sa.String(255), nullable=False),
        sa.Column('status', sa.String(50), nullable=False),
        sa.Column('fpo_id', sa.Integer, sa.ForeignKey('fpos.id')),
    )

    # Add other tables as needed

def downgrade():
    op.drop_table('lots')
    op.drop_table('users')
    op.drop_table('fpos')
