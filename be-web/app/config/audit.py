"""
Audit log configuration constants.
"""

import os

# URL of the Winston audit-log microservice.
# Override via environment variable for production deployment.
AUDIT_LOG_URL = os.environ.get("AUDIT_LOG_URL", "http://localhost:3001/log")

# Timeout for audit log HTTP requests (seconds).
# Keep short — audit logging should never block the main request.
AUDIT_LOG_TIMEOUT = int(os.environ.get("AUDIT_LOG_TIMEOUT", "2"))
