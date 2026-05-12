# ACCOUNTING.md — AAA Accounting Implementation

> **TUMBUH** — Tumbuh Untuk Masa depan, Berkarier Untuk Hidup  
> AAA Security Model: **Authentication** ✅ → **Authorization** ✅ → **Accounting** ✅

---

## Overview

This document describes the **Accounting** layer of the AAA (Authentication, Authorization, Accounting) security model implemented in the TUMBUH project. Accounting provides a complete audit trail that records *who* did *what*, *when*, and whether it *succeeded or failed*.

The accounting system uses **[Winston](https://github.com/winstonjs/winston)** — a popular Node.js logging library — to capture and persist structured audit events from the FastAPI backend.

---

## Architecture

```
┌──────────────────────────┐      POST /log (JSON)      ┌────────────────────────────────┐
│      FastAPI Backend     │  ────────────────────────►  │   Winston Audit Log Server     │
│     (port 8000)          │     fire-and-forget         │        (port 3001)             │
│                          │     via daemon thread       │                                │
│  audit_service.py        │                             │  Express + Winston             │
│  (sends events via HTTP) │                             │  Daily-rotating JSON files     │
└──────────────────────────┘                             │  Console output (dev)          │
                                                         │                                │
                                                         │  logs/audit-YYYY-MM-DD.log     │
                                                         │  logs/audit-errors-YYYY-MM-DD  │
                                                         └────────────────────────────────┘
```

### Key Design Decisions

1. **Separate Service** — The audit log server runs independently from the main application. This means:
   - A compromised application server cannot easily tamper with audit logs
   - Log processing doesn't slow down API responses
   - The audit server can be deployed to a different machine in production

2. **Fire-and-Forget** — Audit events are sent in background threads (`daemon=True`) so they never block the FastAPI response. If the audit server is unreachable, the main application continues operating normally.

3. **No Extra Python Dependencies** — The `audit_service.py` uses Python's built-in `urllib` library, so no additional pip packages are needed.

---

## What Gets Logged

### Authentication Events

| Action | Level | When |
|--------|-------|------|
| `AUTH_LOGIN_SUCCESS` | `info` | User successfully logs in |
| `AUTH_LOGIN_FAILURE` | `warn` | Failed login — wrong email or password |
| `AUTH_LOGIN_BLOCKED` | `warn` | Login attempt on deactivated account |
| `AUTH_REGISTER` | `info` | New user account created |
| `AUTH_REGISTER_DUPLICATE` | `warn` | Registration attempt with existing email |
| `AUTH_TOKEN_REFRESH` | `info` | JWT token refreshed |

### Application (Lamaran) Events

| Action | Level | When |
|--------|-------|------|
| `APPLICATION_SUBMIT` | `info` | Student applies to an opportunity |
| `APPLICATION_STATUS_UPDATE` | `info` | HR changes application status (accept/reject) |
| `APPLICATION_BULK_STATUS_UPDATE` | `info` | HR bulk-updates multiple applications |

### Opportunity (Lowongan) Events

| Action | Level | When |
|--------|-------|------|
| `OPPORTUNITY_CREATE` | `info` | HR creates a new job listing |
| `OPPORTUNITY_UPDATE` | `info` | HR modifies a job listing |
| `OPPORTUNITY_DELETE` | `warn` | HR deletes a job listing |

### Company (Perusahaan) Events

| Action | Level | When |
|--------|-------|------|
| `COMPANY_CREATE` | `info` | New company profile created |
| `COMPANY_UPDATE` | `info` | Company profile updated |
| `COMPANY_DELETE` | `warn` | Company deleted |

### User (Pengguna) Events

| Action | Level | When |
|--------|-------|------|
| `USER_PROFILE_UPDATE` | `info` | User modifies their own profile |

### Externship (Eksternship) Events

| Action | Level | When |
|--------|-------|------|
| `EXTERNSHIP_CREATE` | `info` | Student creates externship record |
| `EXTERNSHIP_UPDATE` | `info` | Student modifies externship record |
| `EXTERNSHIP_DELETE` | `warn` | Student deletes externship record |

### System Events

| Action | Level | When |
|--------|-------|------|
| `RATE_LIMIT_EXCEEDED` | `warn` | Too many requests from a single client |
| `UNHANDLED_ERROR` | `error` | Unexpected server error (500) |

---

## Log Entry Format

Each log entry is a structured JSON object:

```json
{
  "level": "info",
  "message": "User logged in: budi.santoso@apps.ipb.ac.id",
  "service": "tumbuh-audit",
  "timestamp": "2026-05-12 21:15:30.123",
  "action": "AUTH_LOGIN_SUCCESS",
  "userId": 1,
  "userRole": "student",
  "userEmail": "budi.santoso@apps.ipb.ac.id",
  "ip": "127.0.0.1",
  "resource": "auth",
  "resourceId": null,
  "success": true
}
```

---

## File Structure

```
audit-log/
├── package.json           # Node.js dependencies
├── server.js              # Express + Winston audit server
├── .gitignore             # Ignores node_modules/ and log files
└── logs/
    ├── .gitkeep           # Keeps the directory in Git
    ├── audit-2026-05-12.log           # Daily JSON log (auto-created)
    └── audit-errors-2026-05-12.log    # Errors/warnings only (auto-created)
```

---

## How to Run

### 1. Start the Audit Log Server

```bash
cd audit-log
npm install          # first time only
npm start            # starts on port 3001
```

### 2. Start the Backend (as usual)

```bash
cd be-web
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Start the Frontend (as usual)

```bash
cd fe-web
npm run dev
```

> **Note:** The backend will work even if the audit log server is not running — audit events will simply be silently dropped. However, for full AAA compliance, always run the audit log server alongside the backend.

---

## Viewing Logs

### Via Log Files
Log files are stored in `audit-log/logs/` with daily rotation:
```bash
# View today's logs
cat audit-log/logs/audit-2026-05-12.log

# View only errors and warnings
cat audit-log/logs/audit-errors-2026-05-12.log
```

### Via API
The audit log server exposes a convenience endpoint:
```bash
# Get the 50 most recent log entries
curl http://localhost:3001/logs/recent
```

### Via Console
When running in development, all audit events are printed to the console with colorized output.

---

## Winston Configuration

| Feature | Value |
|---------|-------|
| **Transport 1** | Daily-rotating JSON file (`audit-YYYY-MM-DD.log`) |
| **Transport 2** | Daily-rotating errors file (`audit-errors-YYYY-MM-DD.log`) |
| **Transport 3** | Console (colorized, human-readable) |
| **Max file size** | 20 MB per file |
| **Retention (all)** | 30 days |
| **Retention (errors)** | 90 days |
| **Compression** | Gzip after rotation |

---

## Files Modified

| File | Changes |
|------|---------|
| `audit-log/package.json` | **NEW** — Node.js dependencies |
| `audit-log/server.js` | **NEW** — Winston audit log server |
| `be-web/app/config/audit.py` | **NEW** — Audit server URL config |
| `be-web/app/services/audit_service.py` | **NEW** — Fire-and-forget HTTP audit client |
| `be-web/app/services/auth_service.py` | **MODIFIED** — Login, register, refresh audit events |
| `be-web/app/services/application_service.py` | **MODIFIED** — Apply, status update audit events |
| `be-web/app/services/opportunity_service.py` | **MODIFIED** — Create, update, delete audit events |
| `be-web/app/services/company_service.py` | **MODIFIED** — Create, update, delete audit events |
| `be-web/app/services/user_service.py` | **MODIFIED** — Profile update audit events |
| `be-web/app/services/externship_service.py` | **MODIFIED** — Create, update, delete audit events |
| `be-web/app/main.py` | **MODIFIED** — Rate limit, unhandled error audit events |
