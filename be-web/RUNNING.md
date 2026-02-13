# How to Run — IPB Career Tracker Backend

Step-by-step guide to get the backend API running locally.

---

## Prerequisites

- **Python 3.10+** installed ([python.org](https://www.python.org/downloads/))
- **pip** (comes with Python)
- **PostgreSQL 15+** installed and running ([postgresql.org](https://www.postgresql.org/download/))
- **Git** (optional, for cloning)

Check your versions:

```bash
python --version
psql --version
```

---

## 1. Navigate to the Backend Directory

```bash
cd be-web
```

---

## 2. Create a Virtual Environment

```bash
# Create
python -m venv myenv

# Activate (Windows — PowerShell)
.\myenv\Scripts\Activate.ps1

# Activate (Windows — CMD)
myenv\Scripts\activate.bat

# Activate (macOS / Linux)
source myenv/bin/activate
```

You should see `(myenv)` in your terminal prompt when activated.

---

## 3. Install Dependencies

```bash
pip install -r requirements.txt
```

This installs: FastAPI, Uvicorn, SQLAlchemy, Pydantic, python-jose (JWT), passlib (bcrypt), and Alembic.

---

## 4. Create the PostgreSQL Database

Open a terminal (or **psql** shell) and create the database:

```bash
# Connect as the postgres superuser
psql -U postgres
```

Then in the psql prompt:

```sql
CREATE DATABASE career_tracker;
\q
```

> If you use a different username/password, update the `DATABASE_URL` in step 5.

---

## 5. Configure Environment Variables

Copy the example env file and edit it:

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env` with your settings:

```dotenv
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/career_tracker
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
SECRET_KEY=change-this-to-a-random-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Replace `YOUR_PASSWORD` with the password you set for your `postgres` user during PostgreSQL installation.

> **Important:** Change `SECRET_KEY` to a strong random string in production.  
> Generate one with: `python -c "import secrets; print(secrets.token_hex(32))"`

---

## 6. Run Database Migrations

The database schema is managed by **Alembic**. Run the migrations to create all tables:

```bash
alembic upgrade head
```

You should see output like:

```
INFO  [alembic.runtime.migration] Running upgrade  -> 0b4bae5b7920, initial tables
INFO  [alembic.runtime.migration] Running upgrade 0b4bae5b7920 -> 489bb7154375, expand schema bookmarks externships
```

This creates all required tables: `users`, `companies`, `opportunities`, `applications`, `bookmarks`, and `externships`.

---

## 7. (Optional) Seed the Database

Populate the database with realistic mock data:

```bash
python -m scripts.seed
```

This creates sample companies, users (password: `password123`), opportunities, applications, bookmarks, and externships.

---

## 8. Run the Server

```bash
uvicorn app.main:app --reload
```

You should see output like:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

The `--reload` flag enables auto-reload on code changes (development only).

---

## 9. Verify It's Running

Open your browser and visit:

| URL                          | Description                                          |
| ---------------------------- | ---------------------------------------------------- |
| http://localhost:8000/health | Health check — should return `{"status": "healthy"}` |
| http://localhost:8000/docs   | **Swagger UI** — interactive API documentation       |
| http://localhost:8000/redoc  | **ReDoc** — alternative API documentation            |

---

## 10. Test the API

### Using Swagger UI (Recommended for beginners)

1. Go to http://localhost:8000/docs
2. Click on any endpoint to expand it
3. Click **"Try it out"**
4. Fill in the request body and click **"Execute"**

### Using cURL

**Register a user:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@apps.ipb.ac.id",
    "password": "password123",
    "first_name": "Rafif",
    "last_name": "Farras",
    "role": "STUDENT"
  }'
```

**Login:**

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@apps.ipb.ac.id",
    "password": "password123"
  }'
```

**Access protected endpoint (use the token from login):**

```bash
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Common Options

### Change the Port

```bash
uvicorn app.main:app --reload --port 8080
```

### Allow External Access

```bash
uvicorn app.main:app --reload --host 0.0.0.0
```

### Run in Production (no reload, multiple workers)

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## Database

The app uses **PostgreSQL**. The database must be created manually (see step 4), and tables are managed by **Alembic migrations** (see step 6).

### Reset the Database

To wipe all data and re-create tables:

```bash
# Drop and recreate the database (in psql)
psql -U postgres -c "DROP DATABASE IF EXISTS career_tracker;"
psql -U postgres -c "CREATE DATABASE career_tracker;"

# Re-run migrations
alembic upgrade head

# (optional) Re-seed
python -m scripts.seed
```

### New Migration After Model Changes

If you modify the SQLAlchemy models, generate a new migration:

```bash
alembic revision --autogenerate -m "describe your change"
alembic upgrade head
```

---

## Troubleshooting

| Problem                                      | Solution                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------- |
| `ModuleNotFoundError: No module named 'app'` | Make sure you're running `uvicorn` from the `be-web/` directory         |
| `No module named 'fastapi'`                  | Activate your virtual environment first: `.\myenv\Scripts\Activate.ps1` |
| Port already in use                          | Use a different port: `--port 8080`                                     |
| `.env` not found                             | Copy `.env.example` to `.env` — see step 5                              |
| `bcrypt` install error                       | Try: `pip install bcrypt` separately, then retry                        |
| `relation "users" does not exist`            | Run `alembic upgrade head` — see step 6                                 |
| `could not connect to server`                | Make sure PostgreSQL is running and `DATABASE_URL` is correct           |
| `database "career_tracker" does not exist`   | Create it first — see step 4                                            |

---

## Quick Start (TL;DR)

```bash
cd be-web
python -m venv myenv
.\myenv\Scripts\Activate.ps1          # Windows
pip install -r requirements.txt
copy .env.example .env                 # then edit DATABASE_URL & SECRET_KEY
psql -U postgres -c "CREATE DATABASE career_tracker;"  # create DB
alembic upgrade head                   # create tables
python -m scripts.seed                 # (optional) load sample data
uvicorn app.main:app --reload
# → Open http://localhost:8000/docs
```
