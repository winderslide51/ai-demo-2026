# CRA project memory

This repository is a 2026 AI-assisted development demo for a monthly timesheet
application ("Compte Rendu d'Activité", or CRA).

Consultants record worked time and absences, review their monthly summary, and submit
their CRA. Managers manage missions and assignments, then approve or reject the CRA
of consultants in their team.

The 17 user stories in `specs/` are the functional source of truth. Implement them in
numeric order, from US-001 through US-017, without anticipating later stories.

## Technology stack

| Side | Technologies |
|---|---|
| Frontend | React, TypeScript in strict mode, Vite |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | SQLite |
| Backend tests | pytest, httpx, pytest-cov |
| Frontend tests | Vitest, Testing Library, V8 coverage |

FastAPI exposes the REST API under `/api/...` and generates the OpenAPI contract.
SQLite keeps the demo self-contained and requires no external database installation.

## Monorepo structure

```text
backend/
  app/
    core/
    db/
    models/
    routers/
    schemas/
    services/
  tests/
frontend/
  src/
    api/
    components/
    hooks/
    pages/
    types/
specs/
README.md
PLAN.MD
AGENT.md
```

- `specs/` contains the French user stories and acceptance criteria.
- `backend/` contains the FastAPI application and its tests.
- `frontend/` contains the React application and its tests.
- Business rules belong in backend services, not in API routers or React components.
- API routers remain thin: validation and transport in routers, domain behavior in
  services, persistence in SQLAlchemy models and repositories.

## Domain model

- `User`: a demo user with a `CONSULTANT` or `MANAGER` role. A manager has a team of
  consultants.
- `Mission`: a client engagement with identifying information, start and end dates,
  and an active or closed state.
- `Assignment`: the association between a consultant and a mission. A consultant may
  record time only on an assigned mission active on the entry date.
- `Cra`: one monthly report per consultant, identified by year and month. It stores
  its status, submission date, and the latest rejection comment when applicable.
- `CraEntry`: activity for a date and a fraction of a day (`1.0` or `0.5`). Mission
  entries reference a mission; absence entries never do.
- `Notification`: information presented to a user when a workflow event requires
  attention.

Entry types are a closed backend-defined list:

- `MISSION`
- `CONGE_PAYE`
- `RTT`
- `MALADIE`
- `SANS_SOLDE`
- `FORMATION`

Core invariants:

- A consultant has at most one CRA for a given year and month.
- The sum of work and absence entries for one day cannot exceed `1.0`.
- Entries are allowed only on working days.
- Mission entries require an accessible mission active on the entry date.
- Absence entries cannot reference a mission.
- Derived monthly totals are calculated when read, not persisted.
- Role and ownership checks are always enforced by the backend.

## CRA lifecycle

```text
DRAFT --submit--> SUBMITTED --approve--> APPROVED
                     |
                     +--reject with comment--> DRAFT
```

- A draft CRA is editable.
- A non-empty draft CRA can be submitted.
- A submitted CRA is immutable until it is rejected.
- Rejection requires a comment, returns the CRA to draft, and preserves the reason.
- An approved CRA is immutable.

The UI displays these statuses in French: `Brouillon`, `Soumis`, and `Validé`.

## Conventions

- Write code, identifiers, comments, technical documentation, and commit messages in
  English.
- Write UI labels, validation messages, API error details, and user-facing exports in
  French.
- Keep specifications in French because they are customer-facing artifacts.
- Use strict typing: Python type hints and strict TypeScript, with no explicit `any`.
- Use Pydantic request and response schemas for API boundaries.
- Use `snake_case` in Python and `camelCase` in JSON and TypeScript.
- Return every non-2xx API response as `{"detail": "<phrase française>"}`.
- Enforce authorization server-side; hiding an action in the UI is not authorization.
- Handle loading, error, and empty states on every data-driven screen.
- Prefer simple, reversible architecture suitable for a demo; do not introduce
  microservices, CQRS, or unnecessary global state.

## Development workflow

1. Read the relevant user story and all of its acceptance criteria before designing or
   coding.
2. Inventory the existing code and freeze the API contract before frontend and backend
   implementation diverge.
3. Write API tests from the acceptance criteria before implementing the endpoint.
4. Implement backend business rules in services and keep routers thin.
5. Implement typed frontend API access through dedicated clients and hooks.
6. Add unit and component tests until both sides meet the 70% coverage floor.
7. Run the application through the Vite `/api` proxy and verify the real user flow.

Never weaken an acceptance test to make an implementation pass. If a test exposes an
incorrect contract, correct the design and implementation.

## Commands

### Backend

Run from the repository root:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

The API is available at `http://localhost:8000`, with OpenAPI documentation at
`http://localhost:8000/docs`.

```bash
cd backend
uv run pytest
uv run ruff check .
```

The pytest configuration must enforce at least 70% coverage and report missing lines.

### Frontend

Run from the repository root:

```bash
cd frontend
npm run dev
```

The application is available at `http://localhost:5173`; Vite proxies `/api` requests
to the backend on port 8000.

```bash
cd frontend
npm test
npm run test:coverage
npm run lint
npm run build
```

The coverage command must enforce at least 70% coverage. The build must include the
TypeScript type check.

This file is the single source of project knowledge for every AI assistant. Tool-specific
entry points must only link here and list their own rules, skills, and agent locations.
