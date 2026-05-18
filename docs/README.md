# Documentation

This directory is the canonical documentation home for TUMBUH. The repository root keeps only the short onboarding `README.md`.

## Start Here

- [Setup](setup.md): local development, environment variables, migrations, seed data, and service startup.
- [Project plan](project-plan.md): personas, roadmap, priorities, and PM recommendation.
- [Testing](testing.md): manual QA scenarios, auth showcase, API checks, and the full test matrix.

## Engineering Docs

- [Backend](backend.md): FastAPI service responsibilities, structure, API surface, auth, and backend conventions.
- [Frontend](frontend.md): React app structure, routing, API integration, design system, and frontend scripts.
- [Database](database.md): schema overview, relationships, migrations, seed data, and inspection commands.
- [Audit logging](audit-logging.md): Winston audit service, event categories, log format, and runtime behavior.

## Operations

- [Deployment](deployment.md): Supabase connection modes, Dokploy guidance, service deployment, and team workflow.

## Documentation Rules

- Keep root-level Markdown limited to `README.md`.
- Put feature, setup, testing, and operations docs in `docs/`.
- If a new document duplicates an existing section, merge it into the closest canonical document instead.
- Do not record QA statuses as passed unless they came from an executed test run.
