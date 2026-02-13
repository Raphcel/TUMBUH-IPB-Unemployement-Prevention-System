# IPB Career Tracker — Backend API

A RESTful backend service for the **IPB Career Tracker** platform, built with **Python** and **FastAPI** following **Object Oriented Programming** principles.

IPB Career Tracker connects IPB University students with career opportunities — internships, full-time positions, and scholarships — posted by partner companies.

---

## Tech Stack

| Layer      | Technology                 |
| ---------- | -------------------------- |
| Framework  | FastAPI 0.115              |
| Language   | Python 3.10+               |
| ORM        | SQLAlchemy 2.0             |
| Validation | Pydantic v2                |
| Auth       | JWT (python-jose) + bcrypt |
| Database   | PostgreSQL 15+             |
| Migrations | Alembic                    |
| Server     | Uvicorn (ASGI)             |

> See [DATABASE.md](DATABASE.md) for full schema documentation, ER diagram, and usage guide.

---

## Quick Start

```bash
cd be-web
python -m venv myenv
.\myenv\Scripts\Activate.ps1              # Windows (use source myenv/bin/activate on macOS/Linux)
pip install -r requirements.txt
copy .env.example .env                     # then edit DATABASE_URL & SECRET_KEY
psql -U postgres -c "CREATE DATABASE career_tracker;"  # create PostgreSQL database
alembic upgrade head                       # run migrations to create all tables
python -m scripts.seed                     # (optional) populate with sample data
uvicorn app.main:app --reload
# → Open http://localhost:8000/docs
```

> **Prerequisites:** Python 3.10+, PostgreSQL 15+  
> See [RUNNING.md](RUNNING.md) for detailed step-by-step instructions.

---

## Architecture

The project follows **Clean Architecture** with strict layer separation:

```
Request → Routes (API) → Services (Business Logic) → Repositories (Data Access) → Database
```

Each layer only depends on the layer below it, never upward.

### Project Structure

```
be-web/
├── app/
│   ├── main.py                  # Application factory (FastAPI instance)
│   ├── __init__.py
│   │
│   ├── config/                  # Configuration & database setup
│   │   ├── settings.py          # Pydantic Settings (env vars)
│   │   └── database.py          # SQLAlchemy engine, session, Base
│   │
│   ├── domain/                  # Domain layer — entities & business rules
│   │   └── models/
│   │       ├── user.py          # User model (Student / HR roles)
│   │       ├── company.py       # Company model
│   │       ├── opportunity.py   # Opportunity model (Internship / Full-time / Scholarship)
│   │       ├── application.py   # Application model (status tracking)
│   │       ├── bookmark.py      # Bookmark model (saved opportunities)
│   │       └── externship.py    # Externship model (student projects)
│   │
│   ├── schemas/                 # Pydantic DTOs — request/response validation
│   │   ├── user.py              # UserCreate, UserLogin, UserResponse, TokenResponse
│   │   ├── company.py           # CompanyCreate, CompanyUpdate, CompanyResponse
│   │   ├── opportunity.py       # OpportunityCreate, OpportunityUpdate, OpportunityResponse
│   │   ├── application.py       # ApplicationCreate, StatusUpdate, ApplicationResponse
│   │   ├── bookmark.py          # BookmarkCreate, BookmarkResponse
│   │   └── externship.py        # ExternshipCreate, ExternshipUpdate, ExternshipResponse
│   │
│   ├── repositories/            # Data access layer — database queries
│   │   ├── base.py              # Generic BaseRepository<T> with CRUD
│   │   ├── user_repository.py   # User-specific queries
│   │   ├── company_repository.py
│   │   ├── opportunity_repository.py
│   │   ├── application_repository.py
│   │   ├── bookmark_repository.py
│   │   └── externship_repository.py
│   │
│   ├── services/                # Business logic layer
│   │   ├── auth_service.py      # Registration, login, JWT, password hashing
│   │   ├── user_service.py      # Profile management
│   │   ├── company_service.py   # Company CRUD & search
│   │   ├── opportunity_service.py  # Opportunity CRUD, search & filters
│   │   ├── application_service.py  # Apply, status updates, history tracking
│   │   ├── bookmark_service.py  # Save/unsave opportunities
│   │   └── externship_service.py   # Student externship CRUD
│   │
│   └── api/                     # Presentation layer — HTTP interface
│       ├── router.py            # Central router (/api/v1 prefix)
│       ├── dependencies.py      # FastAPI Dependency Injection wiring
│       └── routes/
│           ├── auth.py          # POST /register, POST /login
│           ├── users.py         # GET/PUT /me, GET /{id}
│           ├── companies.py     # CRUD endpoints
│           ├── opportunities.py # CRUD + search/filter
│           ├── applications.py  # Apply, list, status updates
│           ├── bookmarks.py     # Save/unsave/list bookmarks
│           └── externships.py   # Student externship CRUD
│
├── alembic/                     # Database migration files
│   ├── env.py                   # Migration environment config
│   └── versions/                # Auto-generated migration scripts
│
├── scripts/
│   └── seed.py                  # Seed database with mock data
│
├── alembic.ini                  # Alembic configuration
├── requirements.txt             # Python dependencies
├── .env.example                 # Environment variable template
├── DATABASE.md                  # Database schema documentation
└── .gitignore
```

---

## Domain Models

### User

Represents both **Students** and **HR** staff, distinguished by a `role` enum.

| Field                          | Type         | Description                |
| ------------------------------ | ------------ | -------------------------- |
| `id`                           | int          | Primary key                |
| `email`                        | str          | Unique, indexed            |
| `hashed_password`              | str          | bcrypt hash                |
| `first_name` / `last_name`     | str          | Display name               |
| `role`                         | UserRole     | `STUDENT` or `HR`          |
| `phone`                        | str          | Phone number (optional)    |
| `bio`                          | text         | Short bio (optional)       |
| `nim`                          | str          | Student ID number, indexed |
| `major` / `university` / `gpa` | str/float    | Student-only fields        |
| `cv_url`                       | str          | CV file URL (optional)     |
| `company_id`                   | FK → Company | HR-only field              |
| `is_active`                    | bool         | Account active flag        |

### Company

Partner companies that post opportunities.

| Field            | Type  | Description                  |
| ---------------- | ----- | ---------------------------- |
| `id`             | int   | Primary key                  |
| `name`           | str   | Company name, indexed        |
| `industry`       | str   | e.g. "Technology", "Finance" |
| `location`       | str   | City/region                  |
| `description`    | text  | Company bio                  |
| `website`        | str   | URL                          |
| `rating`         | float | Average rating               |
| `employee_count` | int   | Number of employees          |
| `founded_year`   | int   | Year founded                 |
| `linkedin_url`   | str   | LinkedIn profile URL         |
| `instagram_url`  | str   | Instagram profile URL        |
| `tagline`        | str   | Company tagline/motto        |

### Opportunity

Job/internship/scholarship postings linked to a company.

| Field          | Type            | Description                              |
| -------------- | --------------- | ---------------------------------------- |
| `id`           | int             | Primary key                              |
| `title`        | str             | Position title, indexed                  |
| `company_id`   | FK → Company    | Owning company                           |
| `type`         | OpportunityType | `INTERNSHIP`, `FULL_TIME`, `SCHOLARSHIP` |
| `location`     | str             | Work location                            |
| `salary`       | str             | Salary range                             |
| `requirements` | str (JSON)      | List of requirements                     |
| `is_active`    | bool            | Whether posting is live, indexed         |
| `deadline`     | datetime        | Application deadline                     |

### Application

Tracks a student's application to an opportunity with status history.

| Field            | Type              | Description                                                     |
| ---------------- | ----------------- | --------------------------------------------------------------- |
| `id`             | int               | Primary key                                                     |
| `student_id`     | FK → User         | Applicant                                                       |
| `opportunity_id` | FK → Opportunity  | Target position                                                 |
| `status`         | ApplicationStatus | `APPLIED` → `SCREENING` → `INTERVIEW` → `ACCEPTED` / `REJECTED` |
| `history`        | str (JSON)        | Timestamped status change log                                   |

### Bookmark

Saved/bookmarked opportunities for students.

| Field            | Type             | Description            |
| ---------------- | ---------------- | ---------------------- |
| `id`             | int              | Primary key            |
| `user_id`        | FK → User        | Student who bookmarked |
| `opportunity_id` | FK → Opportunity | Saved opportunity      |
| `created_at`     | datetime         | When bookmarked        |

> Unique constraint on `(user_id, opportunity_id)` — no duplicate bookmarks.

### Externship

Student project/externship records (independent study, bootcamps, etc.).

| Field         | Type             | Description                  |
| ------------- | ---------------- | ---------------------------- |
| `id`          | int              | Primary key                  |
| `student_id`  | FK → User        | Owning student               |
| `title`       | str              | Project/externship title     |
| `company`     | str              | Company or organization name |
| `duration`    | str              | e.g. "6 months"              |
| `description` | text             | What was done                |
| `status`      | ExternshipStatus | `ONGOING` or `COMPLETED`     |

---

## API Endpoints

All routes are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint         | Description         | Auth |
| ------ | ---------------- | ------------------- | ---- |
| POST   | `/auth/register` | Register a new user | —    |
| POST   | `/auth/login`    | Login, returns JWT  | —    |

### Users

| Method | Endpoint      | Description              | Auth |
| ------ | ------------- | ------------------------ | ---- |
| GET    | `/users/me`   | Get current user profile | JWT  |
| PUT    | `/users/me`   | Update profile           | JWT  |
| GET    | `/users/{id}` | Get user by ID           | JWT  |

### Companies

| Method | Endpoint          | Description        | Auth |
| ------ | ----------------- | ------------------ | ---- |
| GET    | `/companies/`     | List all companies | —    |
| GET    | `/companies/{id}` | Get company detail | —    |
| POST   | `/companies/`     | Create company     | HR   |
| PUT    | `/companies/{id}` | Update company     | HR   |
| DELETE | `/companies/{id}` | Delete company     | HR   |

### Opportunities

| Method | Endpoint                      | Description               | Auth |
| ------ | ----------------------------- | ------------------------- | ---- |
| GET    | `/opportunities/`             | List/search opportunities | —    |
| GET    | `/opportunities/{id}`         | Get opportunity detail    | —    |
| GET    | `/opportunities/company/{id}` | List by company           | —    |
| POST   | `/opportunities/`             | Create opportunity        | HR   |
| PUT    | `/opportunities/{id}`         | Update opportunity        | HR   |
| DELETE | `/opportunities/{id}`         | Delete opportunity        | HR   |

**Query parameters** for `GET /opportunities/`: `search`, `type`, `location`, `skip`, `limit`

### Applications

| Method | Endpoint                         | Description               | Auth    |
| ------ | -------------------------------- | ------------------------- | ------- |
| POST   | `/applications/`                 | Apply to opportunity      | Student |
| GET    | `/applications/me`               | My applications           | Student |
| GET    | `/applications/opportunity/{id}` | Applicants for listing    | HR      |
| PATCH  | `/applications/{id}/status`      | Update application status | HR      |

### Bookmarks

| Method | Endpoint                      | Description              | Auth    |
| ------ | ----------------------------- | ------------------------ | ------- |
| POST   | `/bookmarks/`                 | Save an opportunity      | Student |
| DELETE | `/bookmarks/{opportunity_id}` | Remove bookmark          | Student |
| GET    | `/bookmarks/me`               | List my bookmarked items | Student |
| GET    | `/bookmarks/check/{opp_id}`   | Check if bookmarked      | Student |

### Externships

| Method | Endpoint            | Description         | Auth    |
| ------ | ------------------- | ------------------- | ------- |
| POST   | `/externships/`     | Create externship   | Student |
| GET    | `/externships/me`   | List my externships | Student |
| PUT    | `/externships/{id}` | Update externship   | Student |
| DELETE | `/externships/{id}` | Delete externship   | Student |

---

## Authentication & Authorization

- **JWT Bearer tokens** — sent via `Authorization: Bearer <token>` header
- **Password hashing** — bcrypt (direct, via `bcrypt` library)
- **Role-based access** — `require_role("hr")` / `require_role("student")` dependency guards
- Token expiry configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` env var (default: 60 min)

---

## Design Patterns

| Pattern                  | Where                 | Purpose                                                  |
| ------------------------ | --------------------- | -------------------------------------------------------- |
| **Repository**           | `repositories/`       | Abstracts all database access behind a clean interface   |
| **Generic Repository**   | `base.py`             | `BaseRepository<T>` provides reusable CRUD for any model |
| **Service Layer**        | `services/`           | Encapsulates business logic, keeps routes thin           |
| **Dependency Injection** | `api/dependencies.py` | FastAPI's `Depends()` wires repos → services → routes    |
| **Application Factory**  | `main.py`             | `create_app()` builds the FastAPI instance               |
| **DTO / Schema**         | `schemas/`            | Pydantic models validate input and shape output          |

---

## Environment Variables

| Variable                      | Default                                                             | Description                             |
| ----------------------------- | ------------------------------------------------------------------- | --------------------------------------- |
| `DATABASE_URL`                | `postgresql://postgres:YOUR_PASSWORD@localhost:5432/career_tracker` | PostgreSQL connection string            |
| `DB_POOL_SIZE`                | `5`                                                                 | SQLAlchemy connection pool size         |
| `DB_MAX_OVERFLOW`             | `10`                                                                | Max overflow connections                |
| `SECRET_KEY`                  | —                                                                   | JWT signing key (change in production!) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                                                                | Token expiry duration                   |

> **Important**: Tables are managed by [Alembic](https://alembic.sqlalchemy.org/) migrations.  
> After configuring `.env`, run `alembic upgrade head` to create all database tables.  
> See [RUNNING.md](RUNNING.md) for full setup instructions.

---

## Seed Data

Pre-populate the database with realistic mock data:

```bash
cd be-web
.\myenv\Scripts\activate     # Windows
python -m scripts.seed
```

This creates:

- **5 companies** — Tokopedia, Gojek, Bank Indonesia, Bukalapak, Telkom Indonesia
- **6 users** — 3 students + 3 HR staff (password: `password123`)
- **6 opportunities** — internships, full-time, scholarship
- **7 applications** with status history
- **5 bookmarks** and **3 externships**

> See [DATABASE.md](DATABASE.md) for the full list of seeded accounts and how to query the data.

---

## License

This project is part of the **ADS (Analisis & Desain Sistem)** coursework at IPB University.
