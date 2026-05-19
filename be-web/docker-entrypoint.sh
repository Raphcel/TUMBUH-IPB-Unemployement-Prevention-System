#!/bin/sh
set -eu

python - <<'PY'
import os
import sys
import time

from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

database_url = os.environ["DATABASE_URL"]
deadline = time.monotonic() + int(os.environ.get("DB_WAIT_TIMEOUT", "60"))

while True:
    try:
        engine = create_engine(database_url, pool_pre_ping=True)
        with engine.connect() as connection:
            connection.execute(text("select 1"))
        break
    except SQLAlchemyError as exc:
        if time.monotonic() >= deadline:
            print(f"Database did not become ready: {exc}", file=sys.stderr)
            raise
        print("Waiting for database...")
        time.sleep(2)
PY

alembic upgrade head

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
