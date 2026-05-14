# DEPLOYMENT.md — Deploying TUMBUH to Production

> Guide for deploying the TUMBUH project (including the Winston Audit Log) to **Vercel**, a **VPS**, and **Supabase**.

---

## Current Architecture (Localhost)

```
localhost:5174  →  React Frontend (Vite)
localhost:8000  →  FastAPI Backend (Uvicorn)
localhost:3001  →  Winston Audit Log Server (Express)
localhost:5432  →  PostgreSQL Database
```

In production, each of these will live on a different service:

```
Vercel          →  React Frontend
VPS (Railway/   →  FastAPI Backend
  Render/DO)
VPS or Vercel   →  Winston Audit Log Server
Supabase        →  PostgreSQL Database
```

---

## Step 1: Migrate Database to Supabase

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region closest to your users (e.g., Singapore for Indonesia)
3. Set a strong database password — save it securely

### 1.2 Get Your Connection String

After project creation, go to **Settings → Database → Connection string → URI** and copy it. It looks like:

```
postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 1.3 Update Backend Configuration

In your `be-web/.env` file (or your VPS environment variables), replace:

```env
# Old (localhost)
DATABASE_URL=postgresql://postgres:user123@localhost:5432/career_tracker

# New (Supabase)
DATABASE_URL=postgresql://postgres.[project-ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 1.4 Run Migrations Against Supabase

```bash
cd be-web

# Make sure your .env points to Supabase
alembic upgrade head

# (Optional) Seed demo data
python -m scripts.seed
```

> [!IMPORTANT]
> Supabase uses port **6543** (connection pooling via PgBouncer) or **5432** (direct). Use **6543** for production apps. If Alembic migrations fail on 6543, temporarily switch to port 5432 for migrations only, then switch back.

---

## Step 2: Deploy the Audit Log Server

The Winston audit log server is a standalone Node.js app. You have two options:

### Option A: Deploy to a VPS (Recommended for logs)

Good choices: **Railway**, **Render**, **DigitalOcean App Platform**, or any Linux VPS.

#### Railway / Render (Easiest)

1. Push your code to GitHub
2. Create a new service on [Railway](https://railway.app) or [Render](https://render.com)
3. Set the **Root Directory** to `audit-log`
4. Set the **Start Command** to `npm start`
5. Set environment variable: `AUDIT_PORT=3001` (or let the platform assign a port via `PORT`)
6. Note the deployed URL (e.g., `https://tumbuh-audit.up.railway.app`)

#### Modify `server.js` for Platform Port

Most platforms provide a `PORT` environment variable. The `server.js` already handles this:

```js
const PORT = process.env.AUDIT_PORT || process.env.PORT || 3001;
```

> [!TIP]
> If you use Railway or Render, update `server.js` line to also check `process.env.PORT`:
> ```js
> const PORT = process.env.AUDIT_PORT || process.env.PORT || 3001;
> ```

### Option B: Deploy to Vercel (Serverless — Limited)

> [!WARNING]
> Vercel is **serverless** — it doesn't have persistent file storage. This means Winston's file-based logging **will not persist** between requests. If you deploy the audit log to Vercel, you need to replace the file transports with a cloud-based solution (e.g., log to Supabase tables or an external logging service like Logtail/Betterstack).

If you still want Vercel for the audit log:

1. Create `audit-log/vercel.json`:

```json
{
  "version": 2,
  "builds": [{ "src": "server.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "server.js" }]
}
```

2. Replace the file transports in `server.js` with a database transport (see "Cloud Logging Alternative" section below).

---

## Step 3: Deploy the FastAPI Backend

### Option A: Railway / Render

1. Create a new service, set **Root Directory** to `be-web`
2. Set the **Start Command** to:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
3. Add environment variables:
   ```
   DATABASE_URL=postgresql://postgres.[ref]:[pass]@...supabase.com:6543/postgres
   SECRET_KEY=your-strong-random-secret
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   DEBUG=False
   ```
4. Note the deployed URL (e.g., `https://tumbuh-api.up.railway.app`)

### Option B: DigitalOcean / Traditional VPS

```bash
# On your VPS
git clone https://github.com/your-username/TUMBUH.git
cd TUMBUH/be-web

python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://..."
export SECRET_KEY="your-strong-secret"

# Run with gunicorn for production
pip install gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Update Audit Log URL

After deploying the audit log server, update the backend to point to it:

**`be-web/app/config/audit.py`:**

```python
import os

# In production, set AUDIT_LOG_URL environment variable
AUDIT_LOG_URL = os.environ.get("AUDIT_LOG_URL", "http://localhost:3001/log")
AUDIT_LOG_TIMEOUT = 2
```

Then set the environment variable on your backend's hosting platform:

```
AUDIT_LOG_URL=https://tumbuh-audit.up.railway.app/log
```

---

## Step 4: Deploy the Frontend to Vercel

### 4.1 Configure API URL

Create `fe-web/.env.production`:

```env
VITE_API_URL=https://tumbuh-api.up.railway.app/api/v1
```

### 4.2 Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Set **Root Directory** to `fe-web`
3. Framework Preset: **Vite**
4. Add environment variable:
   ```
   VITE_API_URL=https://tumbuh-api.up.railway.app/api/v1
   ```
5. Deploy!

### 4.3 Update Backend CORS

Add your Vercel domain to `be-web/app/config/settings.py` or via environment variable:

```python
CORS_ORIGINS: list[str] = [
    "http://localhost:5174",
    "https://tumbuh.vercel.app",        # ← add your Vercel domain
    "https://your-custom-domain.com",   # ← if using custom domain
]
```

---

## Step 5: Update All Cross-Service URLs

Here's a checklist of URLs that need to change for production:

| Config Location | Variable | Localhost | Production |
|----------------|----------|-----------|------------|
| `fe-web/.env.production` | `VITE_API_URL` | `http://127.0.0.1:8000/api/v1` | `https://tumbuh-api.up.railway.app/api/v1` |
| `be-web/.env` | `DATABASE_URL` | `postgresql://...localhost:5432/...` | `postgresql://...supabase.com:6543/postgres` |
| `be-web/.env` | `SECRET_KEY` | `your-secret-key...` | A strong random string (32+ chars) |
| `be-web/app/config/audit.py` | `AUDIT_LOG_URL` | `http://localhost:3001/log` | `https://tumbuh-audit.up.railway.app/log` |
| `be-web/app/config/settings.py` | `CORS_ORIGINS` | `localhost:5174` | `your-vercel-domain.vercel.app` |

---

## Cloud Logging Alternative (Optional)

If you want to avoid running a separate audit log server entirely, you can log directly to a **Supabase table** from the FastAPI backend.

### Create an Audit Log Table in Supabase

```sql
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    level VARCHAR(10) NOT NULL DEFAULT 'info',
    action VARCHAR(100) NOT NULL,
    user_id INTEGER,
    user_role VARCHAR(20) DEFAULT 'anonymous',
    user_email VARCHAR(255),
    ip VARCHAR(45),
    resource VARCHAR(50),
    resource_id INTEGER,
    detail TEXT,
    success BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
```

Then modify `be-web/app/services/audit_service.py` to insert into this table via SQLAlchemy instead of sending HTTP requests to the Winston server. This removes the need for the Node.js audit log service entirely — but you lose the Winston-specific features (daily rotation, multiple transports, etc.).

---

## Production Checklist

- [ ] Supabase database created and migrations run
- [ ] Backend deployed with correct `DATABASE_URL` and `SECRET_KEY`
- [ ] Audit log server deployed (or replaced with Supabase table)
- [ ] `AUDIT_LOG_URL` updated in backend config
- [ ] Frontend deployed to Vercel with correct `VITE_API_URL`
- [ ] CORS origins updated to include Vercel domain
- [ ] Test login flow end-to-end
- [ ] Verify audit logs are being recorded
- [ ] Set `DEBUG=False` in production

---

## Recommended Hosting Costs

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **Vercel** (Frontend) | ✅ Free | Generous free tier for static/SSR sites |
| **Railway** (Backend + Audit) | ✅ $5 trial credit | $5/month after trial; great for small projects |
| **Render** (Backend + Audit) | ✅ Free tier | Free tier sleeps after 15 min inactivity |
| **Supabase** (Database) | ✅ Free tier | 500 MB storage, 2 projects free |

> [!TIP]
> For a student project, you can run both the FastAPI backend and the Audit Log server on a single Railway/Render service by using a process manager like `supervisord` or by combining them into a Docker Compose setup.
