import html
import logging
from urllib.parse import urljoin

from app.config.settings import get_settings

logger = logging.getLogger(__name__)


class EmailService:
    """Thin Resend wrapper for transactional notification emails."""

    def __init__(self):
        self._settings = get_settings()

    @property
    def is_configured(self) -> bool:
        return bool(
            self._settings.EMAIL_ENABLED
            and self._settings.RESEND_API_KEY
            and self._settings.EMAIL_FROM
        )

    def send_notification_email(
        self,
        to_email: str,
        subject: str,
        message: str,
        *,
        to_name: str | None = None,
        action_label: str | None = None,
        action_url: str | None = None,
    ) -> bool:
        """Send an email for a high-value in-app notification.

        Email failures must not break the product action that created the notification.
        """
        if not self.is_configured:
            return False

        try:
            self.send_email(
                to_email,
                subject,
                html_body=self._build_html(subject, message, action_label, action_url),
                text_body=self._build_text(message, action_label, action_url),
                to_name=to_name,
            )
            return True
        except Exception:
            logger.exception("Failed to send notification email to %s", to_email)
            return False

    def send_email(
        self,
        to_email: str,
        subject: str,
        *,
        html_body: str,
        text_body: str,
        to_name: str | None = None,
    ) -> bool:
        if not self.is_configured:
            return False

        try:
            import resend

            resend.api_key = self._settings.RESEND_API_KEY
            params = {
                "from": self._settings.EMAIL_FROM,
                "to": [self._format_recipient(to_email, to_name)],
                "subject": subject,
                "html": html_body,
                "text": text_body,
            }
            if self._settings.EMAIL_REPLY_TO:
                params["reply_to"] = self._settings.EMAIL_REPLY_TO

            resend.Emails.send(params)
            return True
        except Exception:
            logger.exception("Failed to send email to %s", to_email)
            return False

    def _build_html(
        self,
        subject: str,
        message: str,
        action_label: str | None,
        action_url: str | None,
    ) -> str:
        escaped_subject = html.escape(subject)
        escaped_message = html.escape(message)
        action_html = ""
        absolute_url = self._absolute_url(action_url)
        if action_label and absolute_url:
            action_html = (
                '<p style="margin:28px 0 0">'
                f'<a href="{html.escape(absolute_url)}" '
                'style="background:#1f6f43;color:#ffffff;text-decoration:none;'
                'padding:12px 18px;border-radius:10px;font-weight:700;display:inline-block">'
                f"{html.escape(action_label)}</a></p>"
            )

        return f"""
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17231b;max-width:560px;margin:0 auto;padding:24px">
          <p style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#4c7a5f;margin:0 0 12px">TUMBUH</p>
          <h1 style="font-size:24px;line-height:1.25;margin:0 0 16px">{escaped_subject}</h1>
          <p style="font-size:16px;margin:0;color:#33453a">{escaped_message}</p>
          {action_html}
          <p style="font-size:12px;color:#66756b;margin-top:32px">You received this because this update is related to your TUMBUH account.</p>
        </div>
        """

    def _build_text(
        self,
        message: str,
        action_label: str | None,
        action_url: str | None,
    ) -> str:
        absolute_url = self._absolute_url(action_url)
        if action_label and absolute_url:
            return f"{message}\n\n{action_label}: {absolute_url}"
        return message

    def _absolute_url(self, action_url: str | None) -> str | None:
        if not action_url:
            return None
        if action_url.startswith(("http://", "https://")):
            return action_url
        return urljoin(self._settings.FRONTEND_URL.rstrip("/") + "/", action_url.lstrip("/"))

    @staticmethod
    def _format_recipient(email: str, name: str | None) -> str:
        if not name:
            return email
        safe_name = name.replace('"', "'")
        return f'"{safe_name}" <{email}>'
