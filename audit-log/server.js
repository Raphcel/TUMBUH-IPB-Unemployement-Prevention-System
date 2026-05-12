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
