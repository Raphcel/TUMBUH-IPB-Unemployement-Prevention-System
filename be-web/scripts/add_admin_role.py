"""Rename the lowercase 'admin' enum value to uppercase 'ADMIN' to match the pattern."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.config.settings import get_settings

engine = create_engine(get_settings().DATABASE_URL)
with engine.connect() as conn:
    conn.execute(text("ALTER TYPE userrole RENAME VALUE 'admin' TO 'ADMIN'"))
    conn.commit()
    result = conn.execute(text("SELECT unnest(enum_range(NULL::userrole))"))
    vals = [r[0] for r in result]
    print(f"Updated userrole values: {vals}")
