# Setup

Use this guide for local development. Deployment-specific choices are covered in [Deployment](deployment.md).

## Prerequisites

- Node.js and npm.
- Python 3.11+ recommended.
- Docker Desktop if using local PostgreSQL.
- PostgreSQL client tools are optional but useful for inspection.

## Services

| Service | Path | Default URL | Purpose |
|---|---|---|---|
| Frontend | `fe-web/` | `http://localhost:5173` | React + Vite user interface |
| Backend | `be-web/` | `http://127.0.0.1:8000` | FastAPI API and auth |
| Audit log | `audit-log/` | `http://localhost:3001` | Optional Winston audit service |
| PostgreSQL | Docker Compose | `localhost:5433` | Local development database |

## Backend Environment

Create a backend environment file:

```bash
cd be-web
cp .env.example .env
```

For local Docker PostgreSQL:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/career_tracker
```

For shared Supabase development, use the Session Pooler URL with SSL:

```env
DATABASE_URL=postgresql://postgres.xvtwlzwjzjhqfgutkavw:YOUR_PASSWORD@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require
```

Do not commit real credentials.

## Local Database

From the repository root:

```bash
docker compose up -d postgres
```

The container uses database `career_tracker`, user `postgres`, password `postgres`, and host port `5433`.

## Backend

Install dependencies and initialize the database:

```bash
cd be-web
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
```

Run the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Open Swagger UI at `http://127.0.0.1:8000/docs`.

## Frontend

```bash
cd fe-web
npm install
npm run dev
```

If the frontend should call a non-local backend, set:

```env
VITE_API_URL=https://your-backend.example.com/api/v1
```

## Audit Log Service

The backend continues to work if the audit service is not running. Start it when you need audit events:

```bash
cd audit-log
npm install
npm start
```

The backend sends audit events to `AUDIT_LOG_URL` when configured.

## Verification

Use these checks after setup:

```bash
cd be-web
alembic current
```

```bash
cd fe-web
npm run build
```

Manual QA scenarios are in [Testing](testing.md).
