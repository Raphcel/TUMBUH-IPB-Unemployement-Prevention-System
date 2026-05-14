<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Bogor_Agricultural_University_%28IPB%29_symbol.svg" alt="IPB University" width="100" />
</p>

<h1 align="center">TUMBUH</h1>

<p align="center">
  <strong>IPB Career & Internship Tracker</strong>
</p>

## About

TUMBUH is a career and internship platform for IPB University students, HR staff, and admins. The repository contains:

- `fe-web/`: React + Vite frontend
- `be-web/`: FastAPI backend with SQLAlchemy, Alembic, and JWT auth
- `audit-log/`: Express + Winston audit log service

## Architecture

TUMBUH keeps the backend as the system of record. Supabase is used as managed PostgreSQL only.

```text
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> PostgreSQL
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> Supabase Postgres
```

This branch does not migrate auth to Supabase Auth and does not use Supabase client-side database access from the frontend.

## Database Modes

The project supports three database modes:

1. Local PostgreSQL through Docker Compose for isolated development.
2. Shared Supabase PostgreSQL for dev/staging collaboration.
3. Future production Supabase PostgreSQL behind the deployed FastAPI backend.

Recommended usage:

- Use local Docker when you need an isolated database and do not want to affect teammates.
- Use the Supabase Session Pooler for normal shared development and most deployments when IPv4 compatibility is needed.
- Use the Supabase direct connection only on persistent backend hosts that support IPv6.
- Treat the transaction pooler as a serverless-only option and verify SQLAlchemy compatibility before using it.

## Quick Start

### Frontend only

If you only need the frontend, point `VITE_API_URL` at a shared deployed dev backend and run the frontend locally.

```bash
cd fe-web
npm install
npm run dev
```

### Full local stack with Docker PostgreSQL

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
```

Then start the backend:

```bash
cd be-web
cp .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The Docker Compose PostgreSQL service is exposed on host port `5433`, not `5432`.

### Backend against shared Supabase dev/staging

Use the backend locally while pointing `DATABASE_URL` at the shared Supabase database:

```bash
cd be-web
cp .env.example .env
# edit DATABASE_URL to the Session Pooler URL with the real password
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Recommended `DATABASE_URL` format for this project:

```env
DATABASE_URL=postgresql://postgres.xvtwlzwjzjhqfgutkavw:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Do not expose this URL or any database credentials in frontend code.

## Supabase Connection Guidance

Supabase connection details provided for this project:

- Direct connection host: `db.xvtwlzwjzjhqfgutkavw.supabase.co`
- Direct connection port: `5432`
- Direct connection database: `postgres`
- Direct connection user: `postgres`
- Session Pooler host: `aws-1-ap-northeast-1.pooler.supabase.com`
- Session Pooler port: `5432`
- Session Pooler database: `postgres`
- Session Pooler user: `postgres.xvtwlzwjzjhqfgutkavw`

Preferred connection choice:

- Direct connection: for persistent backend hosts when IPv6 is available.
- Session Pooler: for normal development, staging, and IPv4-only environments.
- Transaction pooler: only for serverless or short-lived connections after checking SQLAlchemy behavior.

Unless the dashboard-provided URL already includes SSL configuration, append `?sslmode=require` to the SQLAlchemy and Alembic `DATABASE_URL`.

## Schema Setup

For an empty Supabase database:

```bash
cd be-web
alembic upgrade head
```

For an existing database whose data must be preserved:

1. Use `pg_dump` from the source database.
2. Restore with `pg_restore` into the target Supabase database.
3. Run validation queries to confirm row counts, constraints, and sequence values.
4. Run `alembic current` and confirm the migration state matches the backend code before applying new migrations.

Alembic remains the source of truth for schema changes. Developers making schema changes must generate Alembic migrations and coordinate before applying them to the shared Supabase database.

## Environment Variables

Backend variables to configure in `be-web/.env`:

- `DATABASE_URL`: PostgreSQL connection string for local Docker or Supabase
- `DB_POOL_SIZE`: SQLAlchemy pool size
- `DB_MAX_OVERFLOW`: SQLAlchemy overflow connections
- `SECRET_KEY`: JWT signing key
- `ACCESS_TOKEN_EXPIRE_MINUTES`: access token lifetime in minutes

See [be-web/.env.example](/home/ubuntu/TUMBUH/be-web/.env.example) and [be-web/RUNNING.md](/home/ubuntu/TUMBUH/be-web/RUNNING.md) for concrete examples.

## Team Workflow

- Frontend-only developers can point `VITE_API_URL` at a shared deployed dev backend.
- Backend developers can run FastAPI locally while pointing `DATABASE_URL` at a shared Supabase dev database.
- Developers changing schema must create Alembic migrations and coordinate when working against the shared database.
- Local Docker Compose remains supported for isolated database work and migration rehearsal.

## Verification

Backend import smoke test:

```bash
cd be-web && python -m compileall app
```

If PostgreSQL or Supabase credentials are configured locally, you can also run:

```bash
cd be-web && alembic upgrade head
```

## Optional Tooling

Supabase suggests optional agent tooling:

```bash
npx skills add supabase/agent-skills
```

This project does not require that tooling because Supabase is being used as plain PostgreSQL through SQLAlchemy and Alembic.
