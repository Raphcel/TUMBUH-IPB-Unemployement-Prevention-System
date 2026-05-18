# TUMBUH

IPB Career & Internship Tracker is a web platform for IPB students, HR staff, and platform admins.

The repository contains three services:

- `fe-web/`: React + Vite frontend.
- `be-web/`: FastAPI backend with SQLAlchemy, Alembic, JWT auth, and PostgreSQL.
- `audit-log/`: Express + Winston audit logging service.

## Quick Start

Start PostgreSQL from the repository root:

```bash
docker compose up -d postgres
```

Start the backend:

```bash
cd be-web
cp .env.example .env
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Start the frontend:

```bash
cd fe-web
npm install
npm run dev
```

The local PostgreSQL container is exposed on host port `5433`.

## Documentation

All detailed project documentation lives in [`docs/`](docs/README.md):

- [Setup](docs/setup.md)
- [Backend](docs/backend.md)
- [Frontend](docs/frontend.md)
- [Database](docs/database.md)
- [Deployment](docs/deployment.md)
- [Testing](docs/testing.md)


## Architecture

TUMBUH keeps the FastAPI backend as the system of record. Supabase, when used, is treated as managed PostgreSQL only.

```text
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> PostgreSQL
React frontend -> FastAPI backend -> SQLAlchemy/Alembic -> Supabase Postgres
```

The frontend must not access the database directly or contain database credentials.
