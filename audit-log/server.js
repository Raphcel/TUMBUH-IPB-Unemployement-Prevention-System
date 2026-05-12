/**
 * TUMBUH Audit Log Server
 * ━━━━━━━━━━━━━━━━━━━━━━━
 * Lightweight Express server that receives audit events via POST /log
 * and writes them to structured JSON log files using Winston.
 *
 * Part of the AAA (Authentication, Authorization, Accounting) system.
 * This service implements the "Accounting" layer.
 *
 * Usage:
 *   npm install
 *   npm start        → listens on port 3001
 */

const express = require('express');
const cors = require('cors');
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// ── Winston Logger Configuration ─────────────────────────────

const logsDir = path.join(__dirname, 'logs');

/**
 * Custom format that produces a single structured JSON object per line.
 * Each log entry includes: timestamp, level, action, userId, userRole,
 * ip, resource, resourceId, detail, and success flag.
 */
const auditFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.json()
);

/**
 * Console format — human-readable, colorized output for development.
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, action, userId, detail, success }) => {
    const status = success ? '✓' : '✗';
    const user = userId ? `[user:${userId}]` : '[anonymous]';
    return `${timestamp} ${level} ${status} ${action} ${user} — ${detail || ''}`;
  })
);

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'tumbuh-audit' },
  transports: [
    // ── File transport: daily-rotated JSON logs ──────────────
    new winston.transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',             // keep 30 days of logs
      format: auditFormat,
      zippedArchive: true,
    }),

    // ── File transport: errors only ─────────────────────────
    new winston.transports.DailyRotateFile({
      dirname: logsDir,
      filename: 'audit-errors-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '90d',             // keep error logs longer
      level: 'warn',
      format: auditFormat,
      zippedArchive: true,
    }),

    // ── Console transport: development readability ───────────
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ],
});

// ── Express Server ───────────────────────────────────────────

const app = express();
const PORT = process.env.AUDIT_PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * POST /log
 *
 * Receives audit events from the FastAPI backend and logs them.
 *
 * Expected body:
 * {
 *   "action":      "AUTH_LOGIN_SUCCESS",        // event identifier
 *   "level":       "info",                      // info | warn | error
 *   "userId":      42,                          // user performing the action (nullable)
 *   "userRole":    "student",                   // student | hr | anonymous
 *   "userEmail":   "budi@apps.ipb.ac.id",       // for readability (nullable)
 *   "ip":          "127.0.0.1",                 // client IP
 *   "resource":    "auth",                      // resource category
 *   "resourceId":  null,                        // specific resource ID (nullable)
 *   "detail":      "User logged in successfully", // human-readable detail
 *   "success":     true                         // whether the action succeeded
 * }
 */
app.post('/log', (req, res) => {
  const {
    action = 'UNKNOWN_ACTION',
    level = 'info',
    userId = null,
    userRole = 'anonymous',
    userEmail = null,
    ip = null,
    resource = null,
    resourceId = null,
    detail = '',
    success = true,
  } = req.body;

  // Validate log level
  const validLevels = ['error', 'warn', 'info', 'debug'];
  const logLevel = validLevels.includes(level) ? level : 'info';

  logger.log(logLevel, detail, {
    action,
    userId,
    userRole,
    userEmail,
    ip,
    resource,
    resourceId,
    success,
  });

  res.status(201).json({ status: 'logged' });
});

/**
 * GET /
 * Audit Log Dashboard — a beautiful, live-updating UI.
 */
app.get('/', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TUMBUH — Audit Log Dashboard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    :root {
      --bg-primary: #0a0e1a;
      --bg-secondary: #111827;
      --bg-card: #1a1f35;
      --bg-card-hover: #1f2847;
      --border: #2a3150;
      --text-primary: #e8ecf4;
      --text-secondary: #8892b0;
      --text-muted: #5a6380;
      --accent-blue: #60a5fa;
      --accent-green: #34d399;
      --accent-amber: #fbbf24;
      --accent-red: #f87171;
      --accent-purple: #a78bfa;
      --accent-cyan: #22d3ee;
      --glow-blue: rgba(96, 165, 250, 0.15);
      --glow-green: rgba(52, 211, 153, 0.15);
      --glow-amber: rgba(251, 191, 36, 0.15);
      --glow-red: rgba(248, 113, 113, 0.15);
    }

    body {
      font-family: 'Inter', system-ui, sans-serif;
      background: var(--bg-primary);
      color: var(--text-primary);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ── Animated background ─────────────────────────── */
    body::before {
      content: '';
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background:
        radial-gradient(ellipse 80% 60% at 20% 0%, rgba(96,165,250,0.06) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 80% 100%, rgba(167,139,250,0.05) 0%, transparent 60%);
      pointer-events: none; z-index: 0;
    }

    .container {
      max-width: 1400px; margin: 0 auto; padding: 24px 32px;
      position: relative; z-index: 1;
    }

    /* ── Header ──────────────────────────────────────── */
    .header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 32px; flex-wrap: wrap; gap: 16px;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .logo {
      width: 44px; height: 44px; border-radius: 12px;
      background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; box-shadow: 0 4px 20px rgba(96,165,250,0.3);
    }
    .header h1 {
      font-size: 22px; font-weight: 700;
      background: linear-gradient(135deg, var(--text-primary), var(--accent-blue));
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .header-subtitle {
      font-size: 13px; color: var(--text-muted); font-weight: 400;
      margin-top: 2px;
    }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .live-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: var(--accent-green);
      animation: pulse 2s ease-in-out infinite;
      box-shadow: 0 0 8px var(--accent-green);
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(0.85); }
    }
    .live-label { font-size: 13px; color: var(--accent-green); font-weight: 500; }
    .refresh-btn {
      background: var(--bg-card); border: 1px solid var(--border);
      color: var(--text-secondary); padding: 8px 16px; border-radius: 8px;
      font-size: 13px; font-family: inherit; cursor: pointer;
      transition: all 0.2s;
    }
    .refresh-btn:hover {
      background: var(--bg-card-hover); color: var(--text-primary);
      border-color: var(--accent-blue);
    }

    /* ── Stats Row ────────────────────────────────────── */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .stat-card {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 14px; padding: 20px 22px;
      display: flex; align-items: center; gap: 16px;
      transition: all 0.25s ease;
    }
    .stat-card:hover {
      border-color: var(--accent-blue);
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    }
    .stat-icon {
      width: 46px; height: 46px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; flex-shrink: 0;
    }
    .stat-icon.total { background: var(--glow-blue); }
    .stat-icon.success { background: var(--glow-green); }
    .stat-icon.warning { background: var(--glow-amber); }
    .stat-icon.error { background: var(--glow-red); }
    .stat-info { flex: 1; }
    .stat-value {
      font-size: 26px; font-weight: 800; line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .stat-value.total-val { color: var(--accent-blue); }
    .stat-value.success-val { color: var(--accent-green); }
    .stat-value.warning-val { color: var(--accent-amber); }
    .stat-value.error-val { color: var(--accent-red); }
    .stat-label {
      font-size: 12px; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.8px;
      margin-top: 4px; font-weight: 600;
    }

    /* ── Filters ──────────────────────────────────────── */
    .filters {
      display: flex; gap: 10px; margin-bottom: 20px;
      flex-wrap: wrap; align-items: center;
    }
    .filter-btn {
      padding: 7px 16px; border-radius: 20px;
      font-size: 12px; font-weight: 600; font-family: inherit;
      border: 1px solid var(--border); background: var(--bg-card);
      color: var(--text-secondary); cursor: pointer;
      transition: all 0.2s; text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .filter-btn:hover { border-color: var(--accent-blue); color: var(--text-primary); }
    .filter-btn.active {
      background: linear-gradient(135deg, rgba(96,165,250,0.15), rgba(167,139,250,0.1));
      border-color: var(--accent-blue); color: var(--accent-blue);
    }
    .filter-btn.active.level-warn {
      background: var(--glow-amber); border-color: var(--accent-amber);
      color: var(--accent-amber);
    }
    .filter-btn.active.level-error {
      background: var(--glow-red); border-color: var(--accent-red);
      color: var(--accent-red);
    }
    .filter-btn.active.level-info {
      background: var(--glow-green); border-color: var(--accent-green);
      color: var(--accent-green);
    }
    .search-input {
      flex: 1; min-width: 200px;
      padding: 8px 14px; border-radius: 20px;
      font-size: 13px; font-family: inherit;
      border: 1px solid var(--border); background: var(--bg-card);
      color: var(--text-primary); outline: none;
      transition: border-color 0.2s;
    }
    .search-input::placeholder { color: var(--text-muted); }
    .search-input:focus { border-color: var(--accent-blue); }

    /* ── Log Table ────────────────────────────────────── */
    .table-wrap {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: 16px; overflow: hidden;
    }
    table { width: 100%; border-collapse: collapse; }
    thead th {
      padding: 14px 16px; text-align: left;
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px;
      color: var(--text-muted); border-bottom: 1px solid var(--border);
      background: rgba(0,0,0,0.15);
      position: sticky; top: 0; z-index: 2;
    }
    tbody tr {
      border-bottom: 1px solid rgba(42,49,80,0.5);
      transition: background 0.15s;
    }
    tbody tr:hover { background: var(--bg-card-hover); }
    tbody tr:last-child { border-bottom: none; }
    td {
      padding: 12px 16px; font-size: 13px;
      color: var(--text-secondary); vertical-align: middle;
    }
    td.timestamp {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px; color: var(--text-muted);
      white-space: nowrap;
    }

    /* ── Badges ───────────────────────────────────────── */
    .badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 6px;
      font-size: 11px; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.5px;
      white-space: nowrap;
    }
    .badge-info { background: rgba(52,211,153,0.12); color: var(--accent-green); }
    .badge-warn { background: rgba(251,191,36,0.12); color: var(--accent-amber); }
    .badge-error { background: rgba(248,113,113,0.12); color: var(--accent-red); }

    .badge-success {
      background: rgba(52,211,153,0.1); color: var(--accent-green);
      padding: 3px 8px; border-radius: 5px;
      font-size: 11px; font-weight: 600;
    }
    .badge-failure {
      background: rgba(248,113,113,0.1); color: var(--accent-red);
      padding: 3px 8px; border-radius: 5px;
      font-size: 11px; font-weight: 600;
    }

    .action-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px; font-weight: 500;
      color: var(--accent-cyan); white-space: nowrap;
    }

    .user-cell {
      display: flex; flex-direction: column; gap: 2px;
    }
    .user-email { font-size: 12px; color: var(--text-secondary); }
    .user-role {
      font-size: 10px; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 0.5px;
    }

    .detail-text {
      max-width: 360px; overflow: hidden;
      text-overflow: ellipsis; white-space: nowrap;
      color: var(--text-secondary); font-size: 13px;
    }

    /* ── Empty State ──────────────────────────────────── */
    .empty-state {
      text-align: center; padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-state .icon { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state h3 { font-size: 18px; color: var(--text-secondary); margin-bottom: 8px; }
    .empty-state p { font-size: 14px; }

    /* ── Footer ───────────────────────────────────────── */
    .footer {
      text-align: center; padding: 32px 0 16px;
      font-size: 12px; color: var(--text-muted);
    }
    .footer a { color: var(--accent-blue); text-decoration: none; }
    .footer a:hover { text-decoration: underline; }

    /* ── Fade-in animation ────────────────────────────── */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fadeIn 0.3s ease forwards; }

    /* ── Responsive ───────────────────────────────────── */
    @media (max-width: 768px) {
      .container { padding: 16px; }
      .header h1 { font-size: 18px; }
      .stats-row { grid-template-columns: repeat(2, 1fr); }
      td, th { padding: 10px 12px; }
      .detail-text { max-width: 180px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div class="logo">🔒</div>
        <div>
          <h1>TUMBUH Audit Logs</h1>
          <div class="header-subtitle">AAA Accounting · Winston Logger Dashboard</div>
        </div>
      </div>
      <div class="header-right">
        <div class="live-dot"></div>
        <span class="live-label">Live</span>
        <button class="refresh-btn" onclick="fetchLogs()">↻ Refresh</button>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-icon total">📊</div>
        <div class="stat-info">
          <div class="stat-value total-val" id="stat-total">—</div>
          <div class="stat-label">Total Events</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon success">✓</div>
        <div class="stat-info">
          <div class="stat-value success-val" id="stat-success">—</div>
          <div class="stat-label">Successful</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon warning">⚠</div>
        <div class="stat-info">
          <div class="stat-value warning-val" id="stat-warn">—</div>
          <div class="stat-label">Warnings</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon error">✕</div>
        <div class="stat-info">
          <div class="stat-value error-val" id="stat-error">—</div>
          <div class="stat-label">Errors</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <button class="filter-btn active" data-filter="all" onclick="setFilter('all', this)">All</button>
      <button class="filter-btn level-info" data-filter="info" onclick="setFilter('info', this)">Info</button>
      <button class="filter-btn level-warn" data-filter="warn" onclick="setFilter('warn', this)">Warning</button>
      <button class="filter-btn level-error" data-filter="error" onclick="setFilter('error', this)">Error</button>
      <input type="text" class="search-input" id="search" placeholder="Search actions, users, details..." oninput="applyFilters()" />
    </div>

    <!-- Table -->
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Level</th>
            <th>Action</th>
            <th>User</th>
            <th>Result</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody id="log-body">
          <tr><td colspan="6">
            <div class="empty-state">
              <div class="icon">📡</div>
              <h3>Loading audit events...</h3>
            </div>
          </td></tr>
        </tbody>
      </table>
    </div>

    <div class="footer">
      Powered by <a href="https://github.com/winstonjs/winston" target="_blank">Winston</a> · TUMBUH AAA Security · Auto-refreshes every 5s
    </div>
  </div>

  <script>
    let allEntries = [];
    let activeFilter = 'all';

    async function fetchLogs() {
      try {
        const res = await fetch('/logs/recent?limit=200');
        const data = await res.json();
        allEntries = data.entries || [];
        updateStats();
        applyFilters();
      } catch (err) {
        console.error('Failed to fetch logs:', err);
      }
    }

    function updateStats() {
      document.getElementById('stat-total').textContent = allEntries.length;
      document.getElementById('stat-success').textContent =
        allEntries.filter(e => e.success === true).length;
      document.getElementById('stat-warn').textContent =
        allEntries.filter(e => e.level === 'warn').length;
      document.getElementById('stat-error').textContent =
        allEntries.filter(e => e.level === 'error').length;
    }

    function setFilter(filter, btn) {
      activeFilter = filter;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    }

    function applyFilters() {
      const search = document.getElementById('search').value.toLowerCase();
      let filtered = allEntries;

      if (activeFilter !== 'all') {
        filtered = filtered.filter(e => e.level === activeFilter);
      }
      if (search) {
        filtered = filtered.filter(e =>
          (e.action || '').toLowerCase().includes(search) ||
          (e.userEmail || '').toLowerCase().includes(search) ||
          (e.message || '').toLowerCase().includes(search) ||
          (e.detail || '').toLowerCase().includes(search) ||
          (e.resource || '').toLowerCase().includes(search)
        );
      }
      renderTable(filtered);
    }

    function levelBadge(level) {
      const map = {
        info:  '<span class="badge badge-info">● INFO</span>',
        warn:  '<span class="badge badge-warn">▲ WARN</span>',
        error: '<span class="badge badge-error">✕ ERROR</span>',
      };
      return map[level] || '<span class="badge badge-info">' + level + '</span>';
    }

    function renderTable(entries) {
      const body = document.getElementById('log-body');
      if (!entries.length) {
        body.innerHTML = '<tr><td colspan="6">' +
          '<div class="empty-state">' +
          '<div class="icon">🔍</div>' +
          '<h3>No audit events found</h3>' +
          '<p>Try a different filter or perform an action on the site.</p>' +
          '</div></td></tr>';
        return;
      }

      body.innerHTML = entries.map((e, i) => {
        const time = (e.timestamp || '').split(' ').pop() || '—';
        const date = (e.timestamp || '').split(' ').slice(0, -1).join(' ') || '';
        const user = e.userEmail
          ? '<div class="user-cell"><span class="user-email">' + escHtml(e.userEmail) + '</span><span class="user-role">' + escHtml(e.userRole || 'unknown') + '</span></div>'
          : '<span style="color:var(--text-muted)">' + escHtml(e.userRole || 'anonymous') + '</span>';
        const result = e.success
          ? '<span class="badge-success">✓ OK</span>'
          : '<span class="badge-failure">✕ FAIL</span>';
        const detail = escHtml(e.message || e.detail || '—');

        return '<tr class="fade-in" style="animation-delay:' + (i * 0.02) + 's">' +
          '<td class="timestamp" title="' + escHtml(e.timestamp || '') + '">' + escHtml(time) + '</td>' +
          '<td>' + levelBadge(e.level) + '</td>' +
          '<td><span class="action-tag">' + escHtml(e.action || '—') + '</span></td>' +
          '<td>' + user + '</td>' +
          '<td>' + result + '</td>' +
          '<td><span class="detail-text" title="' + detail + '">' + detail + '</span></td>' +
          '</tr>';
      }).join('');
    }

    function escHtml(str) {
      const d = document.createElement('div');
      d.textContent = str || '';
      return d.innerHTML;
    }

    // Initial load + auto-refresh every 5 seconds
    fetchLogs();
    setInterval(fetchLogs, 5000);
  </script>
</body>
</html>`);
});

/**
 * GET /health
 * Health check endpoint for monitoring.
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', service: 'tumbuh-audit-log' });
});

/**
 * GET /logs/recent
 * Returns the last 50 audit log entries (for debugging / dashboard).
 */
app.get('/logs/recent', (_req, res) => {
  const fs = require('fs');
  const today = new Date().toISOString().slice(0, 10);
  const logFile = path.join(logsDir, `audit-${today}.log`);

  if (!fs.existsSync(logFile)) {
    return res.json({ entries: [], total: 0 });
  }

  const content = fs.readFileSync(logFile, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  const entries = lines
    .map((line) => {
      try { return JSON.parse(line); } catch { return null; }
    })
    .filter(Boolean)
    .reverse()      // newest first
    .slice(0, 50);

  res.json({ entries, total: lines.length });
});

// ── Start Server ─────────────────────────────────────────────

app.listen(PORT, () => {
  logger.info(`Audit log server started`, {
    action: 'AUDIT_SERVER_START',
    userId: null,
    userRole: 'system',
    detail: `Listening on port ${PORT}`,
    success: true,
  });
  console.log(`\n🔒 TUMBUH Audit Log Server running on http://localhost:${PORT}\n`);
});
