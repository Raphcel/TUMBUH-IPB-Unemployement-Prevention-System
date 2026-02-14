<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/1/15/Bogor_Agricultural_University_%28IPB%29_symbol.svg" alt="IPB University" width="100" />
</p>

<h1 align="center">IPB Career & Internship Tracker</h1>

<p align="center">
  <strong>TUMBUH</strong> — Tumbuh Untuk Masa depan, Berkarier Untuk Hidup
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61dafb?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/License-Academic-yellow" alt="License" />
</p>

---

## About This Project

> **Course:** Analysis and Design Systems (Analisis dan Desain Sistem) — Semester 6  
> **Institution:** IPB University (Institut Pertanian Bogor)  
> **Academic Year:** 2025/2026

## Team

> IPB University — Analysis and Design Systems (ADS) — Semester 6, 2025/2026

| Name                            | Student ID (NIM) | Role     |
| ------------------------------- | ---------------- | -------- |
| Muhammad Chairulridjal Nurvikri | G6401231082      | -        |
| Adam Naufal                     | G6401231083      | -        |
| Rafif Muhammad Farras           | G6401231102      | -        |

---

This project is a **group assignment** for the Analysis and Design Systems course at IPB University. It demonstrates a complete software development lifecycle — from requirements analysis and system design through full-stack implementation — following industry-standard architectural patterns and modern web technologies.

**IPB Career & Internship Tracker** is a web-based platform that connects IPB University students with career opportunities — internships, full-time positions, and scholarships — posted by partner companies. The system serves two distinct user roles:

| Role         | Capabilities                                                                                                                                  |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Student**  | Browse & search opportunities, apply to positions, track application status, bookmark saved listings, manage externship records, edit profile |
| **HR Staff** | Post & manage job listings, review applicant pools, accept/reject candidates, manage company profile                                          |

---

## System Architecture

The application follows a **client–server architecture** with a clear separation between the frontend SPA and the backend REST API, communicating over HTTP with JWT-based authentication.

```
┌─────────────────────────────┐         HTTP / JSON          ┌──────────────────────────────┐
│         FRONTEND            │  ◄──────────────────────────► │          BACKEND             │
│                             │     JWT Bearer Auth           │                              │
│  React 19 + Vite 7          │                               │  FastAPI + Uvicorn           │
│  Tailwind CSS 4             │                               │  SQLAlchemy 2.0 ORM          │
│  React Router DOM 7         │                               │  Pydantic v2 Validation      │
│  Custom Fetch API Client    │                               │  Alembic Migrations          │
│                             │                               │                              │
│  SPA on port 5174           │                               │  REST API on port 8000       │
└─────────────────────────────┘                               └──────────────┬───────────────┘
                                                                             │
                                                                             │ SQLAlchemy
                                                                             ▼
                                                              ┌──────────────────────────────┐
                                                              │        DATABASE              │
                                                              │                              │
                                                              │  PostgreSQL 15+              │
                                                              │  6 tables, Alembic-managed   │
                                                              │  career_tracker database     │
                                                              └──────────────────────────────┘
```

### Backend — Clean Architecture

The backend strictly follows **Clean Architecture** with unidirectional dependency flow:

```
HTTP Request → Routes (API Layer) → Services (Business Logic) → Repositories (Data Access) → Database
```

Each layer only depends on the layer directly below it, ensuring high cohesion and loose coupling.

---

## Tech Stack

### Frontend (`fe-web/`)

| Category   | Technology              | Purpose                                |
| ---------- | ----------------------- | -------------------------------------- |
| Framework  | React 19.2              | Component-based UI                     |
| Build Tool | Vite 7.2 (SWC)          | Fast dev server & production bundler   |
| Styling    | Tailwind CSS 4          | Utility-first CSS framework            |
| Routing    | React Router DOM 7.13   | Client-side SPA routing                |
| Animation  | Framer Motion 12        | Page transitions & micro-interactions  |
| Icons      | Lucide React, Heroicons | Consistent iconography                 |
| UI         | Headless UI             | Accessible component primitives        |
| HTTP       | Native `fetch` wrapper  | API communication with JWT auto-attach |
| Linting    | ESLint 9 + Prettier     | Code quality & formatting              |

### Backend (`be-web/`)

| Category   | Technology                 | Purpose                                       |
| ---------- | -------------------------- | --------------------------------------------- |
| Framework  | FastAPI 0.115              | Async Python web framework                    |
| Language   | Python 3.10+               | Type-annotated backend logic                  |
| ORM        | SQLAlchemy 2.0             | Database abstraction & relationships          |
| Validation | Pydantic v2                | Request/response schema validation            |
| Auth       | python-jose (JWT) + bcrypt | Token-based authentication & password hashing |
| Database   | PostgreSQL 15+             | Relational data storage                       |
| Migrations | Alembic                    | Schema version control                        |
| Server     | Uvicorn (ASGI)             | High-performance async server                 |

---

## Folder Structure

```
Project/
│
├── README.md                         # ← You are here (top-level overview)
│
├── be-web/                           # Backend — FastAPI REST API
│   ├── app/
│   │   ├── main.py                   # Application factory (FastAPI instance, CORS, routes)
│   │   ├── config/
│   │   │   ├── settings.py           # Pydantic Settings (env vars, CORS origins)
│   │   │   └── database.py           # SQLAlchemy engine, session factory, Base
│   │   ├── domain/models/            # ORM entities (User, Company, Opportunity, Application, …)
│   │   ├── schemas/                  # Pydantic DTOs (request/response validation)
│   │   ├── repositories/             # Data access layer (BaseRepository<T> + entity repos)
│   │   ├── services/                 # Business logic (auth, applications, bookmarks, …)
│   │   └── api/
│   │       ├── router.py             # Central router (/api/v1 prefix)
│   │       ├── dependencies.py       # FastAPI Dependency Injection wiring
│   │       └── routes/               # Route handlers (auth, users, companies, …)
│   ├── scripts/
│   │   └── seed.py                   # Database seeder (demo companies, users, jobs, applications)
│   ├── alembic/                      # Alembic migration versions
│   ├── requirements.txt              # Python dependencies
│   ├── RUNNING.md                    # Detailed backend setup guide
│   └── DATABASE.md                   # Full schema docs, ER diagram, field reference
│
└── fe-web/                           # Frontend — React SPA
    └── ipb-career-tracker/
        ├── src/
        │   ├── main.jsx              # React DOM root mount
        │   ├── App.jsx               # Router setup, AuthProvider, ProtectedRoute
        │   ├── index.css             # Tailwind imports & global styles
        │   ├── api/                  # Fetch-based API client layer (8 modules)
        │   ├── context/              # AuthContext — global JWT & user state
        │   ├── layouts/              # PublicLayout (Navbar+Footer), DashboardLayout (Sidebar)
        │   ├── components/           # Reusable UI: Navbar, Sidebar, Footer, Button, Card, Badge, Input
        │   └── pages/               # Page components
        │       ├── *.jsx             # Public pages (Beranda, Lowongan, Perusahaan, Panduan, …)
        │       ├── student/          # Student dashboard, applications tracker, profile
        │       └── hr/               # HR dashboard, job management, applicant review, company profile
        ├── package.json
        ├── vite.config.js
        ├── tailwind.config.js
        └── README.md                 # Detailed frontend documentation
```

---

## Getting Started

### Prerequisites

| Software   | Version | Download                                      |
| ---------- | ------- | --------------------------------------------- |
| Node.js    | 18+     | [nodejs.org](https://nodejs.org/)             |
| Python     | 3.10+   | [python.org](https://www.python.org/)         |
| PostgreSQL | 15+     | [postgresql.org](https://www.postgresql.org/) |

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ipb-career-tracker.git
cd ipb-career-tracker
```

### 2. Set Up the Database

```sql
-- Connect to PostgreSQL and create the database
psql -U postgres
CREATE DATABASE career_tracker;
\q
```

### 3. Set Up the Backend

```bash
cd be-web

# Create and activate virtual environment
python -m venv myenv
.\myenv\Scripts\Activate.ps1          # Windows PowerShell
# source myenv/bin/activate           # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env                # Windows
# cp .env.example .env                # macOS / Linux
# Then edit .env with your database credentials (see Environment Variables below)

# Run database migrations
alembic upgrade head

# (Optional) Seed demo data
python -m scripts.seed

# Start the backend server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at **http://127.0.0.1:8000** with interactive docs at [/docs](http://127.0.0.1:8000/docs) (Swagger UI).

### 4. Set Up the Frontend

```bash
cd fe-web/ipb-career-tracker

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at **http://127.0.0.1:5174**.

### 5. Demo Accounts

After running the seed script, you can log in with these accounts:

| Role     | Email                         | Password      |
| -------- | ----------------------------- | ------------- |
| Student  | `budi.santoso@apps.ipb.ac.id` | `password123` |
| Student  | `dewi.lestari@apps.ipb.ac.id` | `password123` |
| HR Staff | `hr@tokopedia.com`            | `password123` |
| HR Staff | `hr@gojek.com`                | `password123` |

---

## Environment Variables

### Backend (`be-web/.env`)

| Variable                      | Description                               | Default                                                       |
| ----------------------------- | ----------------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string              | `postgresql://postgres:user123@localhost:5432/career_tracker` |
| `SECRET_KEY`                  | JWT signing secret (change in production) | `your-secret-key-change-in-production`                        |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry duration                     | `60`                                                          |
| `DEBUG`                       | Enable debug mode                         | `True`                                                        |

### Frontend

The API base URL is configured in `fe-web/ipb-career-tracker/src/api/client.js`:

```js
const API_BASE = "http://127.0.0.1:8000/api/v1";
```

---

## API Overview

All endpoints are prefixed with `/api/v1`. Interactive documentation is available at `/docs` (Swagger UI) and `/redoc` (ReDoc).

| Resource          | Method   | Endpoint                            | Auth    | Description                                               |
| ----------------- | -------- | ----------------------------------- | ------- | --------------------------------------------------------- |
| **Auth**          | `POST`   | `/auth/register`                    | —       | Register a new student or HR account                      |
|                   | `POST`   | `/auth/login`                       | —       | Authenticate and receive JWT token                        |
|                   | `GET`    | `/auth/me`                          | JWT     | Get current authenticated user profile                    |
| **Users**         | `GET`    | `/users/{id}`                       | JWT     | Get user by ID                                            |
|                   | `PUT`    | `/users/{id}`                       | JWT     | Update user profile                                       |
| **Companies**     | `GET`    | `/companies`                        | —       | List all companies (with search)                          |
|                   | `GET`    | `/companies/{id}`                   | —       | Get company details                                       |
|                   | `POST`   | `/companies`                        | JWT     | Create a company                                          |
|                   | `PUT`    | `/companies/{id}`                   | JWT     | Update company details                                    |
| **Opportunities** | `GET`    | `/opportunities`                    | —       | List/search opportunities (type, location, query filters) |
|                   | `GET`    | `/opportunities/{id}`               | —       | Get opportunity details                                   |
|                   | `GET`    | `/opportunities/company/{id}`       | —       | List opportunities by company                             |
|                   | `POST`   | `/opportunities`                    | JWT     | Create a new opportunity                                  |
|                   | `PUT`    | `/opportunities/{id}`               | JWT     | Update an opportunity                                     |
|                   | `DELETE` | `/opportunities/{id}`               | JWT     | Delete an opportunity                                     |
| **Applications**  | `POST`   | `/applications`                     | Student | Apply to an opportunity                                   |
|                   | `GET`    | `/applications/me`                  | Student | List own applications (with nested opportunity & company) |
|                   | `GET`    | `/applications/opportunity/{id}`    | HR      | List applicants for an opportunity                        |
|                   | `PATCH`  | `/applications/{id}/status`         | HR      | Accept or reject an application                           |
| **Bookmarks**     | `POST`   | `/bookmarks`                        | Student | Bookmark an opportunity                                   |
|                   | `DELETE` | `/bookmarks/{id}`                   | Student | Remove a bookmark                                         |
|                   | `GET`    | `/bookmarks/me`                     | Student | List own bookmarks                                        |
|                   | `GET`    | `/bookmarks/check/{opportunity_id}` | Student | Check if opportunity is bookmarked                        |
| **Externships**   | `POST`   | `/externships`                      | Student | Create an externship record                               |
|                   | `GET`    | `/externships/me`                   | Student | List own externships                                      |
|                   | `PUT`    | `/externships/{id}`                 | Student | Update an externship                                      |
|                   | `DELETE` | `/externships/{id}`                 | Student | Delete an externship                                      |

---

## Database Schema

The application uses **6 relational tables** managed by Alembic migrations. See [be-web/DATABASE.md](be-web/DATABASE.md) for the complete field-level reference.

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  companies   │──1:N──│  opportunities   │──1:N──│  applications    │
│              │       │                  │       │                  │
│  id          │       │  id              │       │  id              │
│  name        │       │  title           │       │  student_id (FK) │
│  industry    │       │  company_id (FK) │       │  opportunity_id  │
│  location    │       │  type            │       │  status          │
│  logo        │       │  location        │       │  applied_at      │
│  description │       │  salary          │       │  history (JSON)  │
│  website     │       │  description     │       └────────┬─────────┘
│  rating      │       │  requirements    │                │
│  ...         │       │  deadline        │                N:1
└──────┬───────┘       │  is_active       │                │
       │               └────────┬─────────┘       ┌────────┴─────────┐
       1:N                      │                  │     users        │
       │               ┌────────┴─────────┐       │                  │
       │               │   bookmarks      │       │  id              │
       │               │                  │       │  email           │
       │               │  id              │       │  role (student/  │
       │               │  user_id (FK)    │       │        hr)       │
       └───────────────│  opportunity_id  │       │  company_id (FK) │
         (HR staff)    └──────────────────┘       │  nim, major, gpa │
                                                  │  ...             │
                       ┌──────────────────┐       └──────────────────┘
                       │  externships     │               │
                       │                  │──────N:1──────┘
                       │  id              │
                       │  student_id (FK) │
                       │  company_name    │
                       │  role, period    │
                       │  description     │
                       └──────────────────┘
```

### Key Relationships

| Relationship                       | Type         | Description                           |
| ---------------------------------- | ------------ | ------------------------------------- |
| Company → Opportunities            | One-to-Many  | A company posts many job listings     |
| Company ← User (HR)                | One-to-Many  | HR staff belong to a company          |
| User → Applications                | One-to-Many  | A student submits many applications   |
| Opportunity → Applications         | One-to-Many  | A listing receives many applications  |
| User ↔ Opportunity (via Bookmarks) | Many-to-Many | Students save/bookmark opportunities  |
| User → Externships                 | One-to-Many  | A student tracks multiple externships |

---

## Application Routes

### Public Pages (No Authentication)

| Route             | Page              | Description                                                  |
| ----------------- | ----------------- | ------------------------------------------------------------ |
| `/`               | Beranda           | Landing page with featured opportunities & partner companies |
| `/lowongan`       | Lowongan          | Browse & search all opportunities                            |
| `/lowongan/:id`   | Detail Lowongan   | Full opportunity detail with Apply action                    |
| `/perusahaan`     | Perusahaan        | Browse partner companies                                     |
| `/perusahaan/:id` | Detail Perusahaan | Company profile & open positions                             |
| `/panduan`        | Panduan           | Career handbook for students (Year 1–4)                      |
| `/login`          | Login             | Email/password login with demo quick-access buttons          |
| `/register`       | Register          | Registration with role selection                             |

### Student Dashboard (Protected — `student` role)

| Route                | Page         | Description                                   |
| -------------------- | ------------ | --------------------------------------------- |
| `/student/dashboard` | Dashboard    | Stats, recent activity, externship tracker    |
| `/student/lamaran`   | Lamaran Saya | Full application history with status timeline |
| `/student/profil`    | Profil       | Editable student profile form                 |

### HR Dashboard (Protected — `hr` role)

| Route           | Page              | Description                             |
| --------------- | ----------------- | --------------------------------------- |
| `/hr/dashboard` | Dashboard         | Recruitment stats & recent job listings |
| `/hr/lowongan`  | Kelola Lowongan   | Manage company job postings             |
| `/hr/pelamar`   | Pelamar           | Review & accept/reject applicants       |
| `/hr/profil`    | Profil Perusahaan | Editable company profile form           |

---

## Design System

| Token         | Value                       | Usage                                |
| ------------- | --------------------------- | ------------------------------------ |
| Primary Color | `#0f2854` (Navy)            | Headers, buttons, sidebar            |
| Accent Color  | `#bde8f5` (Light Blue)      | Highlights, badges, hover states     |
| Success       | `#16a34a` (Green)           | Accepted status, success toasts      |
| Danger        | `#dc2626` (Red)             | Rejected status, destructive actions |
| Font Stack    | System UI + Sans-serif      | Clean, performant typography         |
| Border Radius | `rounded-lg` / `rounded-xl` | Consistent card & button shapes      |
| Shadows       | `shadow-md` / `shadow-lg`   | Depth & elevation                    |
| Icons         | Lucide React                | 1000+ consistent SVG icons           |

---

## Future Roadmap

- [ ] **Email Notifications** — Notify students on application status changes and new opportunity postings
- [ ] **Resume Upload** — Allow students to upload and manage CV/resume files (PDF)
- [ ] **Advanced Search & Filters** — Full-text search with salary range, deadline, and multi-tag filters
- [ ] **Admin Panel** — Super-admin dashboard for managing companies, users, and platform analytics
- [ ] **Analytics Dashboard** — Visualize application trends, popular companies, and conversion rates
- [ ] **Real-Time Chat** — In-app messaging between HR staff and applicants via WebSocket
- [ ] **Recommendation Engine** — Suggest opportunities based on student major, GPA, and application history
- [ ] **OAuth / SSO** — Integrate IPB University SSO for seamless student authentication
- [ ] **Mobile Responsiveness** — Full responsive design optimization for mobile and tablet devices
- [ ] **CI/CD Pipeline** — Automated testing, linting, and deployment with GitHub Actions
- [ ] **Docker Compose** — One-command development environment setup with containerized services
- [ ] **Unit & Integration Tests** — Pytest for backend, Vitest for frontend with coverage reports

---


## References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [SQLAlchemy 2.0 Documentation](https://docs.sqlalchemy.org/en/20/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Pydantic v2 Documentation](https://docs.pydantic.dev/latest/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/en/latest/)
- [Vite Documentation](https://vitejs.dev/)

---

<p align="center">
  Built with ❤️ at <strong>IPB University</strong> — Department of Computer Science
</p>
