# Deployment

Deployment guidance for TUMBUH with Supabase as managed PostgreSQL while keeping FastAPI, SQLAlchemy, Alembic, and JWT auth in place.

## Supported Architecture

Supabase is used as PostgreSQL only.

```text
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> Supabase Postgres
```

Do not treat Supabase as a replacement for the FastAPI backend in this project.

## Deployment Modes

Supported database modes:

1. Local PostgreSQL through Docker Compose.
2. Shared Supabase PostgreSQL for dev/staging.
3. Future production Supabase PostgreSQL for deployed backend environments.

Local Docker Compose should remain available even if dev and production move to Supabase.

## Supabase Connection Strategy

Project-specific connection details provided by the user:

### Direct connection

- Host: `db.xvtwlzwjzjhqfgutkavw.supabase.co`
- Port: `5432`
- Database: `postgres`
- User: `postgres`

Template:

```text
postgresql://postgres:[YOUR-PASSWORD]@db.xvtwlzwjzjhqfgutkavw.supabase.co:5432/postgres
```

Use this only for persistent backend hosts where IPv6 is available. Supabase marked this connection as not IPv4-compatible.

### Shared Session Pooler

- Host: `aws-1-ap-northeast-1.pooler.supabase.com`
- Port: `5432`
- Database: `postgres`
- User: `postgres.xvtwlzwjzjhqfgutkavw`

Template:

```text
postgresql://postgres.xvtwlzwjzjhqfgutkavw:[YOUR-PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```

Use this for normal development, staging, and deployments that need IPv4-compatible connectivity.

### Transaction Pooler

Treat the transaction pooler as an opt-in serverless pattern only. Do not adopt it for this project unless SQLAlchemy behavior, session handling, and migration workflow have been tested deliberately.

### SSL requirement

Unless the dashboard-provided URL already includes SSL behavior, append `?sslmode=require` to the `DATABASE_URL` used by SQLAlchemy and Alembic.

Recommended example for this project:

```env
DATABASE_URL=postgresql://postgres.xvtwlzwjzjhqfgutkavw:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Do not put the real password into committed files.

## Backend Environment

Configure these backend environment variables:

- `DATABASE_URL`
- `DB_POOL_SIZE`
- `DB_MAX_OVERFLOW`
- `SECRET_KEY`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `AUDIT_LOG_URL` for deployed audit logging integration

Example values:

```env
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
SECRET_KEY=replace-with-a-strong-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

## Backend Setup For Supabase

Developer setup flow:

```bash
cd be-web
cp .env.example .env
# edit DATABASE_URL to the Session Pooler URL with the real password
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

For a deployed backend, set equivalent environment variables in the hosting platform and run migrations as part of release or one-time database initialization.

## Schema Initialization And Migration Workflow

For an empty Supabase database:

```bash
cd be-web && alembic upgrade head
```

For an existing database with data that must be preserved:

1. Export from the source PostgreSQL instance with `pg_dump`.
2. Restore into Supabase with `pg_restore`.
3. Run validation queries to confirm tables, row counts, constraints, and sequence values.
4. Run `cd be-web && alembic current` and confirm the migration state matches the checked-in Alembic history.
5. Apply any pending migrations only after validating that the restored schema is in sync.

Alembic remains the schema authority. Avoid making schema changes manually in the Supabase dashboard unless required for emergency inspection, and reconcile any manual changes back into migrations immediately.

## Service Deployment

### Frontend

Deploy the React app separately, for example on Vercel, and point it at a backend URL:

```env
VITE_API_URL=https://your-backend.example.com/api/v1
```

Frontend code must never contain:

- Database URLs
- Supabase database passwords
- Supabase service role keys
- Supabase anon keys for direct database access

### FastAPI backend

Deploy the backend on a persistent host such as Railway, Render, DigitalOcean, or another VPS/container platform.

Recommended runtime principles:

- Keep JWT auth in the backend.
- Keep SQLAlchemy and Alembic as the data layer.
- Point `DATABASE_URL` to Supabase.
- Use the direct connection when the host supports IPv6 and long-lived connections.
- Otherwise use the Session Pooler URL.

Example startup command:

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### Audit log service

Deploy `audit-log/` separately if audit events are needed in shared environments. Keep in mind that file-based logging on serverless platforms is not persistent.

Set the backend audit endpoint with:

```env
AUDIT_LOG_URL=https://your-audit-service.example.com/log
```

## Team Workflow Guidance

- Frontend-only developers can target a shared deployed backend by setting `VITE_API_URL`.
- Backend developers can run FastAPI locally while pointing `DATABASE_URL` at the shared Supabase dev database.
- Developers making schema changes must generate Alembic migrations and coordinate before applying them to the shared database.
- For isolated work, developers can still use local Docker Compose PostgreSQL on host port `5433`.

## Local Docker Compose Reference

The repository keeps local PostgreSQL available through `docker-compose.yml`:

```bash
docker compose up -d postgres
```

Local Docker connection:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/career_tracker
```

## Optional Tooling

Supabase dashboard tooling may suggest:

```bash
npx skills add supabase/agent-skills
```

That is optional only. It is not required for this project because the application talks to Supabase as plain PostgreSQL through SQLAlchemy and Alembic.

## Dokploy Deployment

Dokploy is a valid deployment target for this repository. The current repository now includes Dockerfiles for:

- `be-web/`
- `fe-web/`
- `audit-log/`

Recommended Dokploy layout:

1. Create a backend application from `be-web/Dockerfile`.
2. Create a frontend application from `fe-web/Dockerfile`.
3. Create the audit-log application from `audit-log/Dockerfile` only if shared audit logging is required.

### Backend in Dokploy

Build context:

```text
be-web
```

Runtime behavior:

- The container runs `alembic upgrade head` before starting Uvicorn.
- The backend listens on `PORT`, defaulting to `8000`.

Required environment variables:

```env
DATABASE_URL=postgresql://postgres.xvtwlzwjzjhqfgutkavw:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
SECRET_KEY=replace-with-a-strong-random-secret
ACCESS_TOKEN_EXPIRE_MINUTES=60
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
CORS_ORIGINS=https://your-frontend.example.com
```

`CORS_ORIGINS` now supports either:

- a comma-separated string
- a JSON array string

Example JSON form:

```env
CORS_ORIGINS=["https://tumbuh.example.com","https://staging-tumbuh.example.com"]
```

### Frontend in Dokploy

Build context:

```text
fe-web
```

The frontend Docker build expects a build arg:

```text
VITE_API_URL
```

Example:

```text
https://api.your-domain.example/api/v1
```

If you place the frontend and backend behind the same public domain with path routing, use:

```text
https://your-frontend.example/api/v1
```

### Audit Log in Dokploy

Build context:

```text
audit-log
```

Then point the backend at it with:

```env
AUDIT_LOG_URL=https://your-audit-service.example.com/log
```

### Git Flow for Dokploy

- You do not need to deploy from GitHub `main`.
- Dokploy can deploy from a feature branch first.
- Push the branch, connect Dokploy to that branch, verify it, then merge to `main` when the deployment is stable.

### Team Development With Supabase

- `be-web/.env` remains local and uncommitted for each developer.
- `be-web/.env.example` stays sanitized and should never contain real credentials.
- Developers who need backend access should copy `.env.example` to `.env` and set the shared Supabase `DATABASE_URL` with the real password.
- Frontend-only developers can skip direct database access and point `VITE_API_URL` at the shared deployed backend instead.
