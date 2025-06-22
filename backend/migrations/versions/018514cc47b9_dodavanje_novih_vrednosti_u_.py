"""dodavanje novih vrednosti u tipkorisnika enum

Revision ID: 018514cc47b9
Revises: 
Create Date: 2025-06-17 15:52:42.645680

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '018514cc47b9'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.execute("ALTER TYPE tipkorisnika ADD VALUE IF NOT EXISTS 'fizicko_lice';")
    op.execute("ALTER TYPE tipkorisnika ADD VALUE IF NOT EXISTS 'pravno_lice';")
    op.execute("ALTER TYPE tipkorisnika ADD VALUE IF NOT EXISTS 'admin';")     


def downgrade():
    pass
