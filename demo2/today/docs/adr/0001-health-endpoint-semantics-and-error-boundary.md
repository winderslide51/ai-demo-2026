# ADR 0001 — Health endpoint semantics and the centralised French error boundary

- **Status**: Accepted
- **Date**: 2026-09-08
- **Deciders**: `architect`
- **Context document**: [design note 0001](../architecture/0001-project-scaffold.md)

## Context

Phase 1 must ship one endpoint, `GET /api/health`, and one screen that displays the API
state in French with loading, success and error states. Two questions must be settled
before `fastapi-dev` and `react-dev` start, because both are expensive to change later:

1. **What does "healthy" mean?** Does the endpoint check the SQLite database, or does it
   only prove that the ASGI process is answering?
2. **Where do error responses get their shape?** `AGENT.md` and the project rules
   require every non-2xx response to be `{"detail": "<phrase française>"}`. FastAPI does
   not do that by default: validation errors return a *list* under `detail`, Starlette's
   `HTTPException` defaults are English, and an unhandled exception produces an HTML/500
   from the server rather than a JSON contract.

These two questions are decided together: the health screen is the first — and, in this
phase, the only — consumer of the error contract, so its semantics determine what the
UI error state actually proves.

## Decision

### 1. `GET /api/health` is a **liveness** probe. It does not touch the database.

The route declares no `Depends(get_db)`, performs no query, and returns a fully
deterministic payload:

```json
{ "status": "ok", "service": "cra-api", "apiVersion": "0.1.0" }
```

Database wiring is still proven at startup: `create_app()` runs
`Base.metadata.create_all(bind=engine)` in the lifespan, so a broken engine or an
unwritable SQLite path fails the process at boot instead of silently degrading a
request.

### 2. The French error contract lives in **one** module, `app/core/errors.py`

Three exception handlers, registered by `create_app()`, are the single error boundary:

| Handler | Scope | Output |
|---|---|---|
| `StarletteHTTPException` | every `HTTPException`, including router-produced `404`/`405` | `{"detail": str}` — English standard phrases replaced by a French default table |
| `RequestValidationError` | Pydantic `422` | `{"detail": "Données invalides : champ : raison ; …"}` — the list is flattened into one French sentence |
| `Exception` | anything unhandled | `500` + `{"detail": "Une erreur interne est survenue."}`, exception logged, never leaked |

Application code always raises `HTTPException(status_code=…, detail="<phrase
française>")`; the handler preserves such details verbatim and only substitutes a
French default when `exc.detail` equals the English standard phrase of the status code.

## Options considered

### Question 1 — health semantics

| Option | Pros | Cons |
|---|---|---|
| **A. Liveness only (chosen)** | Deterministic payload → exact-JSON assertions; tests need no DB fixture; no flakiness from file locks or a missing `.db`; the UI error state maps exactly to "the API/proxy is unreachable", which is the failure the screen exists to reveal; trivially reversible. | Does not detect a broken database at request time (mitigated by `create_all` at startup). |
| B. Readiness: `SELECT 1` on every call | Detects a broken database at request time; more "production-like". | Requires a DB session and fixture in every health test; introduces a second success shape (`ok` vs `degraded`) plus a `503` path, which the UI must render — that is scope this phase explicitly excludes; slower and flakier for a demo; the DB is an empty SQLite file with no table, so `SELECT 1` proves almost nothing today. |
| C. Two endpoints (`/api/health` + `/api/health/ready`) | Standard split; both concerns covered. | Two contracts to freeze and test for zero demo value at this stage. |

**A** wins on the "simplest reliable" criterion: the endpoint must be a trustworthy
signal, and a probe that cannot fail for accidental reasons is the most trustworthy one.
B remains available later as an **additive** `/api/health/ready`, which is why `status`
is modelled as an enum (`HealthStatus.OK`) rather than a bare `"ok"` literal — a future
`degraded` value is additive, not breaking.

### Question 2 — error boundary

| Option | Pros | Cons |
|---|---|---|
| **A. Exception handlers in `core/errors.py` (chosen)** | Uses FastAPI's native mechanism; covers framework-raised errors (`404`, `405`, `422`) that never reach application code; routers stay thin; testable in isolation; one place to extend as stories add `401`/`403`/`409`. | Requires knowing that `TestClient` must be built with `raise_server_exceptions=False` to test the `500` path. |
| B. A custom ASGI middleware rewriting responses | Catches everything, including errors raised in other middleware. | Must parse and rebuild response bodies; interferes with streaming; harder to test; overkill for a demo. |
| C. Per-router `try/except` and manual error payloads | No global machinery. | Duplicated in every future router, guaranteed to drift, and it cannot catch framework-level `404`/`405`/`422` at all. Contradicts "keep routers thin". |

## Consequences

**Positive**

- `react-dev` can assume, for **every** non-2xx status, that `response.json().detail` is
  a `string` in French, ready to display — this is the single assumption the frontend
  API client is built on.
- The frozen health payload allows exact-document assertions on both sides.
- The `422` flattening rule is defined once, in French, and every future story
  (US-016's rejected comment, for instance) inherits it for free.
- Health tests are fast and require no fixture.

**Negative / accepted**

- A database that breaks *after* startup is not surfaced by `/api/health`. Accepted for
  a demo; the mitigation is startup failure plus, if ever needed, an additive readiness
  endpoint.
- The French default phrase table must grow as new status codes appear; it is a small,
  additive table in one file.

**Reversibility**

Both decisions are local. Adding a readiness probe is a new route plus a new schema.
Replacing the handlers with middleware would touch only `core/errors.py` and
`create_app()`. No consumer outside `app/core/errors.py` depends on *how* the shape is
produced — only on the shape itself.
