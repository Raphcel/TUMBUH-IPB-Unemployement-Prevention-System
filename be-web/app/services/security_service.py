"""Security helpers for encryption and digital signatures.

The course deliverable needs concrete encrypt/decrypt and non-repudiation
features. This module keeps those concerns isolated from business services.
"""

from __future__ import annotations

import base64
import hashlib
import json
from typing import Any

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey, Ed25519PublicKey

from app.config.settings import get_settings


ENCRYPTED_PREFIX = "enc:v1:"
SIGNATURE_ALGORITHM = "Ed25519"


class SecurityService:
    """Field encryption and asymmetric digital-signature helper."""

    def __init__(self):
        self._settings = get_settings()
        self._fernet = Fernet(self._field_key())
        self._private_key = self._signature_private_key()
        self._public_key = self._private_key.public_key()

    def encrypt_text(self, value: str | None) -> str | None:
        if value is None or value.startswith(ENCRYPTED_PREFIX):
            return value
        token = self._fernet.encrypt(value.encode("utf-8")).decode("utf-8")
        return f"{ENCRYPTED_PREFIX}{token}"

    def decrypt_text(self, value: str | None) -> str | None:
        if value is None or not value.startswith(ENCRYPTED_PREFIX):
            return value
        token = value.removeprefix(ENCRYPTED_PREFIX).encode("utf-8")
        try:
            return self._fernet.decrypt(token).decode("utf-8")
        except InvalidToken:
            return "[encrypted value could not be decrypted]"

    def sign_payload(self, payload: dict[str, Any]) -> str:
        canonical = self._canonical_json(payload).encode("utf-8")
        signature = self._private_key.sign(canonical)
        return base64.urlsafe_b64encode(signature).decode("ascii")

    def verify_signature(self, payload: dict[str, Any], signature: str) -> bool:
        try:
            raw_signature = base64.urlsafe_b64decode(signature.encode("ascii"))
            self._public_key.verify(raw_signature, self._canonical_json(payload).encode("utf-8"))
            return True
        except Exception:
            return False

    def public_key_pem(self) -> str:
        return self._public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("ascii")

    def build_application_signature_payload(
        self,
        *,
        action: str,
        student_id: int,
        opportunity_id: int,
        status: str,
        timestamp: str,
        actor_id: int | None = None,
    ) -> dict[str, Any]:
        return {
            "action": action,
            "actor_id": actor_id,
            "student_id": student_id,
            "opportunity_id": opportunity_id,
            "status": status,
            "timestamp": timestamp,
        }

    def _field_key(self) -> bytes:
        configured = self._settings.FIELD_ENCRYPTION_KEY
        if configured:
            return configured.encode("utf-8")

        # Development fallback. Production should set FIELD_ENCRYPTION_KEY.
        digest = hashlib.sha256(self._settings.SECRET_KEY.encode("utf-8")).digest()
        return base64.urlsafe_b64encode(digest)

    def _signature_private_key(self) -> Ed25519PrivateKey:
        configured = self._settings.DIGITAL_SIGNATURE_PRIVATE_KEY
        if configured:
            seed = base64.urlsafe_b64decode(configured.encode("ascii"))
        else:
            # Development fallback. Production should set DIGITAL_SIGNATURE_PRIVATE_KEY.
            seed = hashlib.sha256(f"signature:{self._settings.SECRET_KEY}".encode("utf-8")).digest()
        return Ed25519PrivateKey.from_private_bytes(seed[:32])

    @staticmethod
    def _canonical_json(payload: dict[str, Any]) -> str:
        return json.dumps(payload, sort_keys=True, separators=(",", ":"), default=str)


security_service = SecurityService()
