# IPB Career Tracker — Frontend (TUMBUH)

A modern React single-page application for the **IPB Career Tracker** platform, connecting IPB University students with career opportunities — internships, full-time positions, and scholarships — posted by partner companies.

The frontend communicates with a **FastAPI** backend via REST APIs with JWT authentication.

---

## Tech Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Framework     | React 19.2                                 |
| Build Tool    | Vite 7.2 (SWC plugin)                      |
| Styling       | Tailwind CSS 4 (via `@tailwindcss/vite`)   |
| Routing       | React Router DOM 7.13                      |
| Icons         | Lucide React, Heroicons, Material Tailwind |
| UI Components | Headless UI                                |
| HTTP Client   | Native `fetch` with custom wrapper         |
| Auth          | JWT (stored in localStorage)               |
| Linting       | ESLint 9 + Prettier                        |

---

## Features

### Public Pages (No Login Required)

- **Beranda (Home)** — Landing page showcasing featured opportunities and partner companies with hero section and quick-access cards.
- **Lowongan (Opportunities)** — Browse all internships, jobs, and scholarships with search, type filter, and location filter. Logged-in students can bookmark opportunities.
- **Detail Lowongan** — Full opportunity detail (description, requirements, salary, deadline) with one-click Apply button for authenticated students.
- **Perusahaan (Companies)** — Browse partner companies with search by name, industry, or location.
- **Detail Perusahaan** — Company profile page with description, stats, social links, and all open positions listed.
- **Panduan (Career Handbook)** — Step-by-step career guide for students from Year 1 through Year 4.

### Student Dashboard (Login Required — `student` role)

- **Dashboard** — Personalized greeting, application stats (total, active, accepted), recent activity feed, and externship tracker with add/create modal.
- **Lamaran Saya (My Applications)** — Full application history with status badges (Applied → Screening → Interview → Accepted/Rejected) and timeline updates.
- **Profil (Profile)** — Editable profile form (name, email, phone) with save functionality via API.

### HR Dashboard (Login Required — `hr` role)

- **Dashboard** — Recruitment overview with stats cards (total applicants, active jobs, pending review) and recent job listings.
- **Kelola Lowongan (Manage Jobs)** — Table view of all company job postings with applicant counts, status badges, and ability to close listings.
- **Pelamar (Applicants)** — View all applicants across company jobs with Accept/Reject action buttons that update status via API.
- **Profil Perusahaan (Company Profile)** — Editable company profile form (name, industry, location, website, description) with save functionality.

### Authentication

- **Login** — Email/password form with demo quick-access buttons (student & HR accounts). Redirects to role-appropriate dashboard on success.
- **Register** — Full registration form with role selection (Student/HR), password validation, and auto-login on success.
- **Auth Context** — Global auth state via React Context. Persists JWT token in localStorage and hydrates user on page reload via `/auth/me` endpoint.
- **Protected Routes** — Role-based route guards redirect unauthorized users to login, and mismatched roles to their correct dashboard.

---

## Project Structure

```
fe-web/
├── index.html                    # Entry HTML
├── package.json                  # Dependencies & scripts
├── vite.config.js                # Vite config (port 5174, SWC, Tailwind)
├── tailwind.config.js            # Tailwind theme customization
├── eslint.config.js              # ESLint + Prettier config
│
└── src/
    ├── main.jsx                  # React DOM root mount
    ├── App.jsx                   # Router setup, ProtectedRoute, AuthProvider
    ├── index.css                 # Tailwind base imports & global styles
    │
    ├── api/                      # API client layer (fetch wrappers)
    │   ├── client.js             # Base client: token management, request()
    │   ├── auth.js               # login, register, me, logout
    │   ├── opportunities.js      # list, get, listByCompany, create, update, delete
    │   ├── companies.js          # list, get, create, update
    │   ├── applications.js       # apply, mine, listByOpportunity, updateStatus
    │   ├── bookmarks.js          # add, remove, mine, check
    │   ├── externships.js        # create, mine, update, delete
    │   ├── users.js              # get, update
    │   └── index.js              # Barrel export
    │
    ├── context/
    │   └── AuthContext.jsx       # AuthProvider + useAuth() hook
    │
    ├── layouts/
    │   ├── PublicLayout.jsx      # Navbar + Footer wrapper for public pages
    │   └── DashboardLayout.jsx   # Sidebar + content wrapper for dashboards
    │
    ├── components/
    │   ├── layout/
    │   │   ├── Navbar.jsx        # Top navigation bar (auth-aware)
    │   │   ├── Sidebar.jsx       # Dashboard sidebar (auth-aware, role-based)
    │   │   └── Footer.jsx        # Page footer
    │   └── ui/
    │       ├── Button.jsx        # Reusable button component
    │       ├── Card.jsx          # Card + CardBody component
    │       ├── Badge.jsx         # Status badge (success, error, info)
    │       └── Input.jsx         # Form input + select component
    │
    ├── pages/
    │   ├── Beranda.jsx           # Home page
    │   ├── Lowongan.jsx          # Opportunities listing
    │   ├── DetailLowongan.jsx    # Opportunity detail + apply
    │   ├── Perusahaan.jsx        # Companies listing
    │   ├── DetailPerusahaan.jsx  # Company detail + open positions
    │   ├── Panduan.jsx           # Career handbook
    │   ├── Login.jsx             # Login page
    │   ├── Register.jsx          # Registration page
    │   │
    │   ├── student/
    │   │   ├── Dashboard.jsx     # Student dashboard
    │   │   ├── LamaranSaya.jsx   # Application tracker
    │   │   └── Profil.jsx        # Student profile editor
    │   │
    │   └── hr/
    │       ├── Dashboard.jsx     # HR recruitment dashboard
    │       ├── KelolaLowongan.jsx # Job management table
    │       ├── Pelamar.jsx       # Applicant review table
    │       └── ProfilPerusahaan.jsx # Company profile editor
    │
    └── data/
        └── mockData.js           # Legacy mock data (no longer imported)
```

---

## API Integration

The frontend communicates with the FastAPI backend at `http://localhost:8000/api/v1`.

### API Client (`src/api/client.js`)

A custom `fetch` wrapper that handles:

- **Base URL** — configurable via `VITE_API_URL` environment variable
- **JWT token** — automatically attached as `Authorization: Bearer <token>` header
- **Token persistence** — stored in `localStorage`, restored on page reload
- **JSON serialization** — request bodies auto-serialized, responses auto-parsed
- **Error handling** — non-OK responses throw errors with server detail messages

### API Modules

| Module             | Endpoints Used                                                     | Auth Required |
| ------------------ | ------------------------------------------------------------------ | ------------- |
| `auth.js`          | `POST /auth/login`, `POST /auth/register`, `GET /auth/me`          | No / JWT      |
| `opportunities.js` | `GET /opportunities/`, `GET /{id}`, `GET /company/{id}`            | No            |
| `companies.js`     | `GET /companies/`, `GET /{id}`, `PUT /{id}`                        | No / HR       |
| `applications.js`  | `POST /`, `GET /me`, `GET /opportunity/{id}`, `PATCH /{id}/status` | Student / HR  |
| `bookmarks.js`     | `POST /`, `DELETE /{id}`, `GET /me`, `GET /check/{id}`             | Student       |
| `externships.js`   | `POST /`, `GET /me`, `PUT /{id}`, `DELETE /{id}`                   | Student       |
| `users.js`         | `GET /{id}`, `PUT /{id}`                                           | JWT           |

---

## Authentication Flow

```
1. User submits login form (email + password)
2. Frontend calls POST /auth/login → receives { access_token, user }
3. Token saved to localStorage via setToken()
4. AuthContext stores user object in React state
5. All subsequent API calls include Authorization: Bearer <token>
6. On page reload, AuthContext reads token from localStorage
   and calls GET /auth/me to rehydrate the user object
7. Logout clears token from localStorage and resets user state
```

### Protected Routes

Routes are guarded by a `ProtectedRoute` component:

- **Not logged in** → redirected to `/login`
- **Wrong role** (e.g., student tries `/hr/dashboard`) → redirected to correct dashboard
- **Loading** → shows a spinner while auth state is being resolved

---

## Design System

| Token         | Value                       | Usage                            |
| ------------- | --------------------------- | -------------------------------- |
| Primary Color | `#0f2854` (Navy Blue)       | Headers, buttons, nav, branding  |
| Accent Color  | `#bde8f5` (Light Blue)      | Highlights, hover states, badges |
| Typography    | System sans-serif stack     | Clean, high readability          |
| Icons         | `lucide-react`              | All UI icons (no emojis)         |
| Border Radius | `rounded-lg` / `rounded-xl` | Soft, modern card corners        |
| Shadows       | `shadow-sm` / `shadow-md`   | Subtle depth on cards            |

---

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **FastAPI backend** running at `http://localhost:8000` (see [backend README](../be-web/README.md))

### Installation

```bash
cd fe-web
npm install
```

### Development

```bash
npm run dev
```

The app runs at **http://127.0.0.1:5174** by default.

### Build for Production

```bash
npm run build
npm run preview    # Preview the production build locally
```

### Environment Variables

| Variable       | Default                        | Description          |
| -------------- | ------------------------------ | -------------------- |
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL |

Create a `.env` file in the project root to override:

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Demo Accounts

After seeding the backend database, these accounts are available:

| Role    | Email                         | Password      | Dashboard            |
| ------- | ----------------------------- | ------------- | -------------------- |
| Student | `budi.santoso@apps.ipb.ac.id` | `password123` | `/student/dashboard` |
| HR      | `hr@tokopedia.com`            | `password123` | `/hr/dashboard`      |

The Login page includes **quick-access buttons** for both demo accounts.

---

## Route Map

| Path                    | Page               | Auth    | Layout     |
| ----------------------- | ------------------ | ------- | ---------- |
| `/`                     | Home (Beranda)     | Public  | Public     |
| `/lowongan`             | Opportunities List | Public  | Public     |
| `/lowongan/:id`         | Opportunity Detail | Public  | Public     |
| `/perusahaan`           | Companies List     | Public  | Public     |
| `/perusahaan/:id`       | Company Detail     | Public  | Public     |
| `/panduan`              | Career Handbook    | Public  | Public     |
| `/login`                | Login              | Public  | Standalone |
| `/register`             | Register           | Public  | Standalone |
| `/student/dashboard`    | Student Dashboard  | Student | Dashboard  |
| `/student/applications` | My Applications    | Student | Dashboard  |
| `/student/profile`      | Student Profile    | Student | Dashboard  |
| `/hr/dashboard`         | HR Dashboard       | HR      | Dashboard  |
| `/hr/opportunities`     | Manage Jobs        | HR      | Dashboard  |
| `/hr/applicants`        | View Applicants    | HR      | Dashboard  |
| `/hr/company`           | Company Profile    | HR      | Dashboard  |

---

## License

This project is part of the **ADS (Analisis & Desain Sistem)** coursework at IPB University.
