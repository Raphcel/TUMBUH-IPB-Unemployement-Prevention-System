# Unfinished / Still Needs Attention

This file tracks what is not fully done yet for the KOM1315 PDF requirements and what still needs manual evidence.

## Must Do Before Final Submission

- Run the full test checklist in `docs/testing.md` and replace `Not Run` with real results only after executing each test.
- Save real testing evidence/logs for security cases, especially failed authorization, encrypted data, signature verification, and audit integrity.
- Add screenshots or terminal output proving that unauthorized users receive `401` or `403`.
- Add screenshots or database output proving cover letters are stored encrypted in raw database rows.
- Add proof that signed application events verify successfully and fail verification if the payload is changed.
- Add proof that audit log hash chaining detects tampering if a previous log row is edited.

## Security Improvements Still Recommended

- Add field encryption to more sensitive fields if needed, such as phone numbers, student NIM, GPA, profile bio, and structured resume personal information.
- Add a real key-rotation plan for `FIELD_ENCRYPTION_KEY` and `DIGITAL_SIGNATURE_PRIVATE_KEY`.
- Add backup/restore instructions that preserve encryption/signature keys.
- Add email notification preferences if the project wants users to opt out of non-critical emails.

## Deployment / Environment Tasks

- Generate stable production values for `FIELD_ENCRYPTION_KEY` and `DIGITAL_SIGNATURE_PRIVATE_KEY` before deploying with real user data.
- Store production secrets only in Dokploy/environment variables, not committed files.
- Confirm `SECRET_KEY`, `FIELD_ENCRYPTION_KEY`, and `DIGITAL_SIGNATURE_PRIVATE_KEY` are backed up securely. Losing them can break token validation, decryption, or signature continuity.
- Rotate any real API keys/passwords that were pasted into chat or committed accidentally.
- Confirm Resend domain/DNS is verified for `tumbuh.me`.
- Confirm Google OAuth production redirect/origin settings include the deployed frontend domain.
- Confirm Dokploy domains route frontend, backend `/api`, uploads, and audit service correctly.
- Set `AUDIT_DASHBOARD_KEY` in production if the audit service gets a public domain.
- Set `BACKEND_API_URL` to the public backend API URL used by the audit dashboard signature checker.

## Documentation Gaps

- `docs/README.md` references `docs/project-plan.md`, but that file is missing.
- `docs/README.md` references `docs/audit-logging.md`, but that file is missing.
- Add a short security architecture document explaining authentication, authorization, accounting, encryption, signatures, and key management.
- Add a short user manual if the course final report requires it.

## Course Artifact Gaps Outside This Website Repo

- The separate submission repo still needs the required PDF folder structure from the lecturer if that is where course artifacts live.
- The separate submission repo still needs proposal, threat modeling, ERD, architecture diagram, testing plan, monitoring report, final report, and paper artifacts.
- Lecturer collaborator access still needs to be handled in GitHub/GitLab UI.
- Repository naming still needs to match the lecturer format in the course submission repo.
