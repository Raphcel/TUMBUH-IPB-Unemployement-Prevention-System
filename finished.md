# Finished Security/PBL Requirements In TUMBUH

This file maps the KOM1315 PDF requirements to features already present in this TUMBUH website repository.

## Website Product Scope

- TUMBUH is implemented as an IPB career and internship tracker for students, HR users, and admins.
- The repo has a React/Vite frontend in `fe-web/`.
- The repo has a FastAPI/SQLAlchemy/Alembic backend in `be-web/`.
- The repo has a separate Winston audit/accounting service in `audit-log/`.
- The repo has Docker and Dokploy compose deployment files.

## Authentication

- Email/password login is implemented.
- Password registration is implemented.
- Email verification is implemented for password registration.
- Google sign-up/login is implemented.
- HR Google sign-up requires manual first/last name input so Gmail display names are not blindly trusted.
- Access tokens and refresh tokens are implemented with JWT.
- Login/register rate limits are configured through SlowAPI.

## Authorization

- Role-based access control exists for student, HR, and admin users.
- Student-only endpoints include applications, bookmarks, externships, resume profiles, and company follows.
- HR-only endpoints include company management, opportunity management, and applicant status updates.
- Admin-only endpoints include user/company/opportunity management and platform stats.
- Ownership checks are implemented so HR users can only manage their own company resources.
- CV access is restricted to the owner, admins, or HR users connected to a relevant application.

## Accounting / Audit Logging

- A separate `audit-log/` service receives backend audit events.
- Important actions are logged, including auth events, application submit/status changes, profile updates, company changes, opportunity changes, resume changes, and notification creation.
- Audit entries include actor role, actor ID/email where available, resource, resource ID, action, success status, and timestamp.
- Audit log UI exists as a network-style dashboard.
- Audit dashboard has a sidebar-style operations layout with event stream, signature check, chain integrity check, and health navigation.
- Audit log is also integrated into the main TUMBUH admin dashboard at `/admin/audit`, using the same sidebar and card/table style as other admin pages.
- The admin audit page reads audit events and integrity checks through admin-authenticated FastAPI endpoints instead of exposing raw audit service calls from the frontend.
- Audit dashboard can be protected with `AUDIT_DASHBOARD_KEY` when exposed publicly.
- Audit log timestamps are displayed in Indonesian time with 24-hour format.
- Audit log entries now include a SHA-256 hash chain with `previousHash`, `eventHash`, and `integrityAlgorithm` for tamper evidence.
- Audit dashboard includes an in-page chain verifier that checks audit log hash continuity end-to-end.

## Password Hashing / Salting

- Passwords are hashed with `bcrypt`.
- Salt generation is handled by `bcrypt.gensalt()`.
- API responses do not expose `hashed_password`.

## Encryption / Decryption

- A backend `SecurityService` now provides field-level encryption and decryption.
- Application cover letters are encrypted before being stored in the database.
- Encrypted values use a clear `enc:v1:` prefix.
- Application cover letters are decrypted only when building API responses.
- Encryption uses Fernet authenticated symmetric encryption from the `cryptography` package.
- Production can provide `FIELD_ENCRYPTION_KEY`; local development can derive a fallback key from `SECRET_KEY`.

## Digital Signature / Non-Repudiation

- A backend `SecurityService` now provides Ed25519 digital signatures.
- Application submission events are signed.
- HR application status update events are signed.
- Bulk HR application status update events are signed.
- Applications store `signature_payload`, `digital_signature`, and `signature_algorithm`.
- Admin-only API verification exists at `/api/v1/admin/security/applications/{application_id}/signature`.
- Audit dashboard includes an in-page application signature verifier that calls the admin-only backend endpoint with an admin access token.
- Production can provide `DIGITAL_SIGNATURE_PRIVATE_KEY`; local development can derive a fallback private key from `SECRET_KEY`.

## Notifications

- In-app notifications are implemented.
- HR users receive notifications for new applicants.
- Students receive notifications when their application status changes.
- Resend email support exists for email verification and important notification emails.

## Deployment

- Dokploy compose deployment exists in `docker-compose.dokploy.yml`.
- Local Docker override exists in `docker-compose.local.yml`.
- Backend container runs Alembic migrations before starting Uvicorn.
- Frontend supports `VITE_API_URL` and Google client ID build args.
- Runtime secrets are expected through environment variables, not frontend code.

## Documentation Already Present

- Root `README.md` explains the app and service layout.
- `docs/setup.md` documents local setup.
- `docs/backend.md` documents backend structure.
- `docs/frontend.md` documents frontend structure.
- `docs/database.md` documents database structure.
- `docs/deployment.md` documents Supabase/Dokploy deployment.
- `docs/testing.md` contains a broad manual/API test matrix.
