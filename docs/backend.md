# Backend

The backend is a FastAPI application that owns authentication, authorization, business logic, validation, persistence, and API access for TUMBUH.

## Stack

- FastAPI and Uvicorn.
- SQLAlchemy ORM.
- Alembic migrations.
- PostgreSQL.
- Pydantic models.
- JWT access and refresh tokens.
- SlowAPI rate limiting.

## Responsibilities

- Authenticate users and issue JWT tokens.
- Enforce role-based access for students, HR staff, and admins.
- Manage users, companies, opportunities, applications, bookmarks, and externships.
- Keep PostgreSQL as the source of truth through SQLAlchemy and Alembic.
- Send audit events to the audit-log service when configured.

## Structure

```text
be-web/
  app/
    api/          # FastAPI route modules
    config/       # Settings and service configuration
    core/         # Auth, security, and shared core helpers
    db/           # Database session and base metadata
    models/       # SQLAlchemy models
    schemas/      # Pydantic request/response schemas
    services/     # Business logic
    main.py       # FastAPI application
  alembic/        # Migration files
  scripts/        # Utility scripts such as seed data
```

## Local Run

See [Setup](setup.md) for full environment and database steps.

```bash
cd be-web
pip install -r requirements.txt
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Swagger UI is available at `http://127.0.0.1:8000/docs`.

## Main API Areas

| Area | Typical responsibilities |
|---|---|
| Auth | Register, login, refresh token, current user |
| Users | Profile read/update and role-aware user operations |
| Companies | Company profile listing, detail, create, update, delete |
| Opportunities | Job/internship listing, detail, filtering, HR management |
| Applications | Student applications and HR status management |
| Bookmarks | Student saved opportunities |
| Externships | Student externship records |

## Auth Model

- Access tokens are used for protected API requests.
- Refresh tokens are only valid on the refresh endpoint.
- Role checks should happen in the backend, not only in the frontend.
- API responses must not expose password hashes or secrets.

## Conventions

- Add schema changes through Alembic migrations.
- Put business rules in services rather than route handlers.
- Keep environment-specific values in `.env`, never in committed source.
- Update [Testing](testing.md) when user-visible behavior changes.
