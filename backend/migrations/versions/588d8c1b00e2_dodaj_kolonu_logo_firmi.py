"""Dodaj kolonu logo firmi

Revision ID: 588d8c1b00e2
Revises: 018514cc47b9
Create Date: 2025-06-29 08:50:14.179575

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '588d8c1b00e2'
down_revision = '018514cc47b9'
branch_labels = None
depends_on = None


def upgrade():
    # Dodajemo kolonu 'logo' u tabelu 'firme'
    with op.batch_alter_table('firme', schema=None) as batch_op:
        batch_op.add_column(sa.Column('logo', sa.String(length=255), nullable=True))


def downgrade():
    # Uklanjamo kolonu 'logo' u slučaju rollback-a
    with op.batch_alter_table('firme', schema=None) as batch_op:
        batch_op.drop_column('logo')
