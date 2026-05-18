# Frontend

The frontend is a React + Vite application for students, HR staff, and admins.

## Stack

- React 19.
- Vite.
- React Router.
- Tailwind CSS.
- Lucide React icons.
- Framer Motion.
- date-fns.

## Structure

```text
fe-web/
  public/          # Static assets
  src/
    api/           # API client and domain API modules
    components/    # Reusable UI components
    pages/         # Route-level views
    routes/        # Route definitions and protected route logic
    styles/        # Global styling
  package.json
```

## Scripts

```bash
cd fe-web
npm install
npm run dev
npm run build
npm run lint
```

## API Integration

The frontend calls the FastAPI backend through `VITE_API_URL`.

For local backend development:

```env
VITE_API_URL=http://127.0.0.1:8000/api/v1
```

For a deployed backend:

```env
VITE_API_URL=https://your-backend.example.com/api/v1
```

The frontend must never contain database URLs, database passwords, Supabase service role keys, or direct database access logic.

## User Areas

| Area | Purpose |
|---|---|
| Public pages | Landing, opportunity browsing, company browsing, login, register |
| Student dashboard | Profile, applications, bookmarks, externships, opportunity application flow |
| HR dashboard | Company profile, job posting, applicant review, application status updates |
| Admin area | Planned governance tools for users, companies, analytics, and audit logs |

## Routing And Auth

- Store tokens only for API authentication.
- Protected routes should redirect unauthenticated users to login.
- Role-specific pages should check the authenticated user role and call backend-protected APIs.
- Frontend checks are UX guards only; authorization must remain enforced by the backend.

## Design Notes

- Keep operational screens dense and scannable.
- Use existing components and Tailwind conventions before adding new patterns.
- Use icons for compact actions where the meaning is standard.
- Keep forms explicit about validation errors and loading states.
