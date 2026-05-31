from app.services.security_service import ENCRYPTED_PREFIX, security_service


def test_encrypt_decrypt_text_roundtrip():
    raw = "Please consider my application."

    encrypted = security_service.encrypt_text(raw)

    assert encrypted != raw
    assert encrypted.startswith(ENCRYPTED_PREFIX)
    assert security_service.decrypt_text(encrypted) == raw


def test_digital_signature_detects_tampering():
    payload = {
        "action": "APPLICATION_SUBMIT",
        "actor_id": 1,
        "student_id": 1,
        "opportunity_id": 7,
        "status": "Applied",
        "timestamp": "2026-05-31T12:00:00+00:00",
    }

    signature = security_service.sign_payload(payload)

    assert security_service.verify_signature(payload, signature)
    assert not security_service.verify_signature({**payload, "status": "Rejected"}, signature)
