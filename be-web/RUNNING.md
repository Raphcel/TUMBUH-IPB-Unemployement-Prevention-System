# How to Run the Backend

This backend supports both local Docker PostgreSQL and Supabase PostgreSQL. The backend architecture stays the same in both cases: FastAPI, SQLAlchemy, Alembic, and JWT auth remain in place.

## Supported Database Modes

```text
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> PostgreSQL
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> Supabase Postgres
```

Use one of these modes:

1. Local PostgreSQL through Docker Compose for isolated development.
2. Shared Supabase PostgreSQL for dev/staging collaboration.
3. Future production Supabase PostgreSQL for deployed backend environments.

Supabase is used as PostgreSQL only. This backend does not switch to Supabase Auth or frontend-side database access.

## Prerequisites

- Python `3.10+`
- `pip`
- Repository cloned locally
- Optional: Docker if you want the local PostgreSQL container

## 1. Create a Virtual Environment

```bash
cd be-web
python -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
```

For Windows activation, use the equivalent PowerShell or CMD command for your environment.

## 2. Create `.env`

```bash
cd be-web
cp .env.example .env
```

Required backend variables:

- `DATABASE_URL`
- `DB_POOL_SIZE`
- `DB_MAX_OVERFLOW`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`

## 3. Choose a Database Mode

### Option A: Local Docker PostgreSQL

From the repository root:

```bash
docker compose up -d postgres
```

Then in `be-web/.env`, use:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/career_tracker
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
SECRET_KEY=change-this-to-a-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Important: Docker Compose maps host port `5433` to container port `5432`.

### Option B: Shared Supabase Dev/Staging PostgreSQL

Preferred connection for this project:

```env
DATABASE_URL=postgresql://postgres.xvtwlzwjzjhqfgutkavw:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

This is the recommended choice for normal development and IPv4-compatible environments.

Supabase direct connection template:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.xvtwlzwjzjhqfgutkavw.supabase.co:5432/postgres?sslmode=require
```

Use the direct connection only when the backend host has IPv6 support and keeps long-lived connections open.

Transaction pooler guidance:

- Use it only for serverless or short-lived runtimes.
- Verify SQLAlchemy compatibility before adopting it.

Unless the URL copied from Supabase already defines SSL behavior, keep `?sslmode=require` on the connection string.

Do not commit real credentials and do not expose database URLs in frontend code.

## 4. Run Migrations

For either local Docker PostgreSQL or Supabase:

```bash
cd be-web
alembic upgrade head
```

For an empty Supabase database, this is the correct initialization step.

For an existing database with data that must be preserved:

1. Use `pg_dump` and `pg_restore` to move data.
2. Run validation queries for row counts, constraints, and sequence values.
3. Check `alembic current` before applying further migrations.

Developers making schema changes must generate Alembic migrations and coordinate before applying them to the shared database.

## 5. Optional Seed Data

```bash
cd be-web
python -m scripts.seed
```

Only seed shared environments if the team has agreed that demo data belongs there.

## 6. Run the Backend

Exact developer flow:

```bash
cd be-web
cp .env.example .env
# edit DATABASE_URL to the Session Pooler URL with the real password
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The backend will then be available at:

- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`
- `http://127.0.0.1:8000/redoc`

## 7. Frontend Integration

Frontend-only developers do not need local database access if a shared backend already exists. They can point the frontend to a shared deployed backend with:

```env
VITE_API_URL=https://your-dev-backend.example.com/api/v1
```

Backend developers can run FastAPI locally while pointing `DATABASE_URL` at the shared Supabase dev database.

## 8. Verification

Backend import smoke test:

```bash
cd be-web && python -m compileall app
```

If your `.env` contains a real database URL and credentials, you can also run:

```bash
cd be-web && alembic current
cd be-web && alembic upgrade head
```

Do not print or paste environment variable values into logs or docs.

## Troubleshooting

- `could not connect to server`: verify the host, port, password, and SSL mode in `DATABASE_URL`.
- `connection requires a valid client certificate` or SSL negotiation errors: keep `?sslmode=require` unless Supabase already provided an SSL-configured URL.
- `database "career_tracker" does not exist` in local Docker mode: make sure `docker compose up -d postgres` is running and that you are using port `5433`.
- `relation does not exist`: run `alembic upgrade head`.
- `ModuleNotFoundError: No module named 'app'`: run commands from `be-web/`.

## Quick Start

Local Docker PostgreSQL:

```bash
docker compose up -d postgres
cd be-web
cp .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Shared Supabase dev database:

```bash
cd be-web
cp .env.example .env
# edit DATABASE_URL to the Session Pooler URL with the real password
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
