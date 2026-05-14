"""
Audit Service — sends structured audit events to the Winston audit-log server.

This implements the **Accounting** layer of the AAA security model.
All audit calls are fire-and-forget: they run in a background thread so
they never slow down the API response to the client. If the audit server
is unreachable, the failure is logged locally but the main request proceeds.
"""

import logging
import threading
from typing import Optional

import urllib.request
import urllib.error
import json

from app.config.audit import AUDIT_LOG_URL, AUDIT_LOG_TIMEOUT

logger = logging.getLogger(__name__)


def _send_in_background(payload: dict) -> None:
    """Send the audit payload to the Winston server in a daemon thread."""
    def _do_send():
        try:
            data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                AUDIT_LOG_URL,
                data=data,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=AUDIT_LOG_TIMEOUT):
                pass  # 201 Created — logged successfully
        except Exception as exc:
            # Never crash the app because of audit logging
            logger.debug("Audit log server unreachable: %s", exc)

    thread = threading.Thread(target=_do_send, daemon=True)
    thread.start()


def audit_log(
    action: str,
    *,
    level: str = "info",
    user_id: Optional[int] = None,
    user_role: str = "anonymous",
    user_email: Optional[str] = None,
    ip: Optional[str] = None,
    resource: Optional[str] = None,
    resource_id: Optional[int] = None,
    detail: str = "",
    success: bool = True,
) -> None:
    """
    Send an audit event to the Winston audit-log server.

    Parameters
    ----------
    action : str
        Event identifier, e.g. ``AUTH_LOGIN_SUCCESS``.
    level : str
        Log level — ``info``, ``warn``, or ``error``.
    user_id : int, optional
        ID of the user performing the action.
    user_role : str
        Role of the user (``student``, ``hr``, ``anonymous``).
    user_email : str, optional
        Email of the user (for human-readable logs).
    ip : str, optional
        Client IP address.
    resource : str, optional
        Resource category (``auth``, ``application``, ``opportunity``, etc.).
    resource_id : int, optional
        Specific resource ID being acted upon.
    detail : str
        Human-readable description of the event.
    success : bool
        Whether the action succeeded.
    """
    payload = {
        "action": action,
        "level": level,
        "userId": user_id,
        "userRole": user_role,
        "userEmail": user_email,
        "ip": ip,
        "resource": resource,
        "resourceId": resource_id,
        "detail": detail,
        "success": success,
    }
    _send_in_background(payload)
