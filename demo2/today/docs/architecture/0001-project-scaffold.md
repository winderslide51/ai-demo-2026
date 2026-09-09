# Design note 0001 — Project scaffold (Phase 1)

**Status**: Frozen — implementable
**Author**: `architect`
**Scope**: PLAN.MD Phase 1, first bullet ("Initialiser le monorepo")
**Audience**: `fastapi-dev` (owns `backend/**`), `react-dev` (owns `frontend/**`)
**Project root**: `today/` (all paths in this note are relative to it)

---

## 1. Scope

### 1.1 In scope

- A `backend/` FastAPI + SQLAlchemy + SQLite skeleton with `routers/`, `services/`,
  `models/`, `schemas/`, `db/`, `core/` and a `tests/` suite.
- A `frontend/` Vite + React + strict TypeScript skeleton with `pages/`, `components/`,
  `hooks/`, `api/`, `types/` and colocated tests.
- Exactly one screen: an API health screen rendered in French with **loading**,
  **success** and **error** states.
- One frozen endpoint: `GET /api/health`.
- The cross-cutting decisions that cannot be retrofitted cheaply later:
  - `CamelModel` wire base class (`backend/app/schemas/common.py`),
  - the `{"detail": "<phrase française>"}` error contract on **every** non-2xx response,
    including flattened Pydantic `422` and caught unhandled `500`,
  - tooled coverage floors (pytest-cov `--cov-fail-under=70`, Vitest V8 thresholds 70),
  - real lint enforcement of `@typescript-eslint/no-explicit-any` and
    `@typescript-eslint/ban-ts-comment` as **errors**,
  - the Vite `/api` → `http://localhost:8000` dev proxy, with everything verified
    through `http://localhost:5173`.

### 1.2 Out of scope (explicitly forbidden in this phase)

- Any business behaviour from US-001 … US-017: no `User`, `Mission`, `Assignment`,
  `Cra`, `CraEntry`, `Notification` model, no seed data, no `X-Demo-User` handling,
  no authentication, no router other than `health`.
- React Router, global state libraries, HTTP client libraries, CORS middleware,
  Docker, CI workflows, database migrations (Alembic).
- Any modification of `specs/`, `AGENT.md`, `CLAUDE.md`, `PLAN.MD`, `.claude/**`,
  `.github/**`, `.specify/**`, `.mcp.json`, or `docs/**` by a developer agent.

The seed dataset (Phase 1, second bullet) is a **separate** task and is **not**
covered by this note. Do not create it here.

---

## 2. Existing inventory (collision analysis)

Inventory taken at `today/` before design. No application code exists yet.

| Existing path | Owner / purpose | Consequence for this phase |
|---|---|---|
| `AGENT.md` | Single source of project knowledge | Read-only. Layout below matches it exactly. |
| `CLAUDE.md` | Claude Code pointer + Spec Kit managed block | Read-only. Do not regenerate. |
| `.mcp.json` | chrome-devtools MCP server declaration | Read-only. |
| `.claude/agents/*.md` | 5 agent definitions | Read-only. |
| `.claude/rules/{python,react}-{do,dont}.md` | Coding rules | Read-only, but **binding** on all code. |
| `.github/copilot-instructions.md` | Copilot pointer | Read-only. |
| `.github/agents/*.agent.md` | Copilot agent mirrors | Read-only. |
| `.github/instructions/*.instructions.md` | Copilot rule mirrors, `applyTo` `backend/**` and `frontend/**` | Confirms the two top-level code folders **must** be named `backend/` and `frontend/`. |
| `.specify/**` (+ `.specify/.gitignore`) | Spec Kit templates, scripts, constitution | Read-only. Never add files there. |
| `docs/` | **Did not exist**; created by this note | Owned by `architect` only. |

**Findings that constrain the scaffold**

1. There is **no** `backend/`, **no** `frontend/`, **no** `docs/`, **no** `specs/`
   folder inside `today/` yet, and **no** root `package.json`, `pyproject.toml`,
   `.gitignore`, `.editorconfig`, `eslint.config.*`, `vite.config.*` or `tsconfig*.json`.
   The scaffold therefore starts from a clean slate and cannot collide with tooling.
2. `.specify/` already owns a `.gitignore` of its own. To avoid fighting Spec Kit for a
   root-level file, **each side ships its own ignore file**: `backend/.gitignore` and
   `frontend/.gitignore`. **Do not create a root `.gitignore`** and do not edit
   `.specify/.gitignore`.
3. `.github/` is Spec Kit / Copilot territory. **No CI workflow** is added in this phase.
4. Ownership boundaries in the agent definitions are strict (`backend/**` vs
   `frontend/**`). Every scaffold file below therefore lives **inside one of those two
   folders** — there is no shared root-level configuration to arbitrate.

---

## 3. Shared conventions (binding on both sides)

| Topic | Convention |
|---|---|
| Language of code | English: identifiers, comments, tests, docs, commit messages. |
| Language of user-visible text | French: UI labels, API `detail` messages. |
| Python casing | `snake_case`. |
| Wire / TypeScript casing | `camelCase` (see ADR 0004). |
| API prefix | Every route is served under `/api`. |
| Error shape | Every non-2xx response body is exactly `{"detail": "<phrase française>"}` (see §6). |
| Typing | Python: type hints on every parameter and return. TypeScript: `strict`, no `any`, no `@ts-ignore` (enforced by lint, ADR 0003). |
| Layering (backend) | router → service → (later) repository/model. No business logic in routers, no DB access from routers. |
| Layering (frontend) | page → hook → api client. No `fetch` in a component or page. |
| Remote states | Every data-driven screen handles loading and error explicitly. |
| Ports | Backend `8000`, frontend dev server `5173`. All manual verification via `5173`. |
| CORS | **Not** configured. The Vite proxy makes the browser see a same-origin `/api` (ADR 0002). |
| Version string | `0.1.0`, single-sourced from `backend/app/core/config.py`. |

---

## 4. Backend

### 4.1 File tree (`backend/`)

```text
backend/
  pyproject.toml                # deps, ruff config, pytest+coverage config
  .gitignore                    # __pycache__/, .venv/, .pytest_cache/, .coverage, htmlcov/, *.db
  app/
    __init__.py
    main.py                     # create_app() factory, lifespan, router + handler registration
    core/
      __init__.py
      config.py                 # Settings (pydantic-settings): app_name, api_version, database_url
      errors.py                 # French default details + the 3 exception handlers
    db/
      __init__.py
      base.py                   # DeclarativeBase subclass `Base`
      session.py                # engine, SessionLocal, get_db() dependency
    models/
      __init__.py               # empty on purpose: no domain entity in this phase
    routers/
      __init__.py
      health.py                 # GET /api/health only
    schemas/
      __init__.py
      common.py                 # CamelModel
      health.py                 # HealthStatus enum + HealthResponse
    services/
      __init__.py
      health.py                 # build_health_report(settings) -> HealthReport
  tests/
    __init__.py
    conftest.py                 # `client` fixture (TestClient over create_app())
    test_health_api.py          # frozen /api/health contract
    test_error_contract.py      # 404 / 405 / 422 / 500 shapes
    test_schemas_common.py      # CamelModel alias + populate-by-name behaviour
```

### 4.2 Dependencies

Managed with `uv` (the commands in `AGENT.md` are `uv run …`), Python `>=3.12`.

- Runtime: `fastapi`, `uvicorn[standard]`, `sqlalchemy>=2`, `pydantic>=2`, `pydantic-settings`.
- Dev: `pytest`, `pytest-cov`, `httpx` (required by `TestClient`), `ruff`.

### 4.3 Key contracts inside the backend

**`app/schemas/common.py`**

```python
class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
```

Behaviour that tests must pin (see ADR 0004):

- fields are declared `snake_case` in Python;
- `model_dump(by_alias=True)` / FastAPI serialisation emits `camelCase`;
- the model can still be constructed with the Python field name (`populate_by_name=True`);
- the model can also be constructed with the alias.

Every API schema in the project inherits from `CamelModel`. No exception.

**`app/core/config.py`** — `Settings` with `app_name = "cra-api"`,
`api_version = "0.1.0"`, `database_url = "sqlite:///./cra.db"` (overridable via the
`CRA_DATABASE_URL` environment variable), exposed through a cached `get_settings()`.

**`app/db/`** — SQLAlchemy 2.0 style: `Base(DeclarativeBase)` in `base.py`; `engine`
(with `connect_args={"check_same_thread": False}` for SQLite), `SessionLocal` and the
`get_db()` generator dependency in `session.py`. `create_app()` calls
`Base.metadata.create_all(bind=engine)` at startup (lifespan). With an empty
`models/` package this creates no table — it proves the wiring without inventing a
domain. `get_db` is **not** used by any route in this phase (see ADR 0001).

**`app/main.py`** — exposes `create_app() -> FastAPI` and a module-level
`app = create_app()` so that `uv run uvicorn app.main:app --reload` works. The factory
sets `title="CRA API"`, `version=settings.api_version`, includes
`routers.health.router` with `prefix="/api"`, and registers the three exception
handlers from `core/errors.py`.

**`app/routers/health.py`** — thin:

```python
@router.get("/health", response_model=HealthResponse, status_code=200, tags=["health"])
def read_health(settings: Settings = Depends(get_settings)) -> HealthResponse:
    report = health_service.build_health_report(settings)
    return HealthResponse.model_validate(report)
```

**`app/services/health.py`** — returns a `HealthReport` dataclass
(`status`, `service`, `api_version`). It performs **no I/O** and takes no DB session.

---

## 5. Frozen contract — `GET /api/health`

This contract is **frozen**. Neither developer agent may change a field name, a value,
a status code or a message. A contract problem is escalated to `architect`.

### 5.1 Request

| Item | Value |
|---|---|
| Method | `GET` (only; no `POST`/`PUT`/`DELETE`, no `HEAD` route declared) |
| Path (browser / frontend) | `/api/health` (same-origin, proxied) |
| Path (backend direct) | `http://localhost:8000/api/health` |
| Authentication | **None.** The endpoint is public and must stay public. |
| `X-Demo-User` header | **Not required, not read, not validated** — now or after US-001. |
| Request body | None |
| Query parameters | None |
| Required request headers | None |

### 5.2 Success response

| Item | Value |
|---|---|
| Status | `200 OK` |
| `content-type` | `application/json` |
| Body | exactly the three fields below, in this order, no extra field |

```json
{
  "status": "ok",
  "service": "cra-api",
  "apiVersion": "0.1.0"
}
```

Python schema (`app/schemas/health.py`):

```python
class HealthStatus(str, Enum):
    OK = "ok"

class HealthResponse(CamelModel):
    status: HealthStatus
    service: str
    api_version: str      # serialised as "apiVersion"
```

Notes:

- `status` is a closed enum with a single member today; it exists so a future
  `degraded` value is additive rather than breaking.
- `service` is `settings.app_name`, `apiVersion` is `settings.api_version`.
- The payload is **fully deterministic**: no timestamp, no uptime, no host name. Tests
  assert the exact JSON document, and the screen renders it without formatting rules.
- `apiVersion` is the deliberate camelCase probe: it fails loudly if `CamelModel` is
  bypassed.

### 5.3 Database access

**`GET /api/health` does not touch the database.** It is a *liveness* probe, not a
*readiness* probe. Rationale and the rejected alternative are recorded in
**ADR 0001**. Practical consequences:

- the route declares no `Depends(get_db)`;
- `test_health_api.py` needs no database fixture and no temporary file;
- the endpoint returns `200` whenever the ASGI process is up, so the only way to
  reach the UI error state is a stopped backend or a broken proxy — which is exactly
  the failure the health screen exists to reveal.

### 5.4 Failure modes visible to the frontend

| Situation | What the browser observes | What the UI must show |
|---|---|---|
| Backend down / proxy target refused | Vite proxy error → network failure or `500`-class response | error state |
| Wrong method on `/api/health` | `405` + `{"detail": "Méthode non autorisée."}` | not exercised by the UI |
| Unknown path under `/api` | `404` + `{"detail": "Ressource introuvable."}` | not exercised by the UI |

---

## 6. Frozen error contract (all non-2xx responses)

**Invariant**: the body of every non-2xx response produced by the backend is a JSON
object with exactly one key, `detail`, whose value is a **French sentence**, with
`content-type: application/json`. No `errors` array, no `code`, no stack trace, no
English default.

### 6.1 Implementation — three handlers in `app/core/errors.py`

Registered by `create_app()`:

| # | Exception | Produces |
|---|---|---|
| 1 | `starlette.exceptions.HTTPException` | `{"detail": …}` with the raised status code |
| 2 | `fastapi.exceptions.RequestValidationError` | `422` + a single flattened French sentence |
| 3 | `Exception` (catch-all) | `500` + a fixed French sentence, exception logged server-side |

**Handler 1 — French default phrases.** Starlette's own `HTTPException` default detail
is `HTTPStatus(status_code).phrase`, i.e. English ("Not Found", "Method Not Allowed").
The rule is deterministic:

> if `exc.detail` equals the English standard phrase for `exc.status_code`, replace it
> with the French default from the table below; otherwise keep `exc.detail` as raised
> (application code always raises French details).

| Status | French default detail |
|---|---|
| 400 | `Requête invalide.` |
| 401 | `Authentification requise.` |
| 403 | `Accès refusé.` |
| 404 | `Ressource introuvable.` |
| 405 | `Méthode non autorisée.` |
| 409 | `Conflit avec l'état actuel de la ressource.` |
| 422 | `Données invalides.` |
| 500 | `Une erreur interne est survenue.` |
| any other | `Une erreur est survenue.` |

`exc.headers` are propagated when present.

**Handler 2 — flattening Pydantic `422`.** FastAPI's native body is
`{"detail": [{"loc": …, "msg": …, "type": …}, …]}`, a *list*. It is flattened into one
string, deterministically:

1. for each error, `field = ".".join(str(p) for p in err["loc"] if p not in ("body", "query", "path", "header", "cookie"))`
   (the remaining `loc` parts are the wire names, i.e. camelCase aliases);
2. `message = FRENCH_BY_TYPE.get(err["type"], "valeur invalide")`;
3. `part = f"{field} : {message}"` when `field` is non-empty, else `message`;
4. `detail = "Données invalides : " + " ; ".join(parts)` — and plain
   `"Données invalides."` when there is no usable part.

`FRENCH_BY_TYPE` (minimal, extend additively later):

| Pydantic error type | French fragment |
|---|---|
| `missing` | `champ obligatoire` |
| `string_too_short` | `texte trop court` |
| `string_too_long` | `texte trop long` |
| `string_type` | `texte attendu` |
| `int_parsing`, `int_type`, `float_parsing`, `float_type` | `nombre attendu` |
| `bool_parsing`, `bool_type` | `booléen attendu` |
| `date_parsing`, `date_from_datetime_parsing`, `date_type` | `date invalide` |
| `enum`, `literal_error` | `valeur non autorisée` |
| `greater_than`, `greater_than_equal`, `less_than`, `less_than_equal` | `valeur hors limites` |
| anything else | `valeur invalide` |

Example: a missing `commentaire` field yields
`{"detail": "Données invalides : commentaire : champ obligatoire"}`.

**Handler 3 — unhandled `500`.** Logs the exception with `logger.exception(...)` and
returns `{"detail": "Une erreur interne est survenue."}` — never the exception text.
Because `TestClient` re-raises server exceptions by default, the test constructs its
client with `TestClient(app, raise_server_exceptions=False)`.

### 6.2 What this pins for later stories

`fastapi-dev` raises `HTTPException(status_code=…, detail="<phrase française>")` for
every business failure (`400`, `401`, `403`, `404`, `409`). `react-dev` may always
read `response.json().detail` as a `string` and display it directly — for **every**
error status, from this scaffold onwards.

---

## 7. Frontend

### 7.1 File tree (`frontend/`)

```text
frontend/
  package.json
  package-lock.json               # generated by npm install
  .gitignore                      # node_modules/, dist/, coverage/, *.local
  index.html                      # <html lang="fr">, <title>CRA</title>
  vite.config.ts                  # react plugin + /api proxy + vitest test/coverage block
  tsconfig.json                    # solution file referencing the two configs below
  tsconfig.app.json                # strict: true, noUnusedLocals, noUnusedParameters, noFallthroughCasesInSwitch
  tsconfig.node.json
  eslint.config.js                # flat config, typescript-eslint, the two mandatory error rules
  src/
    main.tsx                      # ReactDOM.createRoot(...).render(<StrictMode><App /></StrictMode>)
    App.tsx                       # renders <HealthPage /> (no router in this phase)
    index.css                     # minimal tokens: spacing, colours, focus-visible outline
    vite-env.d.ts
    api/
      client.ts                   # apiGet<T>(path) + ApiError, the only place calling fetch
      client.test.ts
      health.ts                   # fetchHealth(): Promise<HealthDto>
      health.test.ts
    hooks/
      useHealth.ts                # { state, reload }
      useHealth.test.tsx
    pages/
      HealthPage.tsx              # orchestrates the hook + the three states
      HealthPage.test.tsx
    components/
      StatusMessage.tsx           # pure presentation: tone + title + description + optional action
      StatusMessage.test.tsx
    types/
      api.ts                      # RequestState<T> discriminated union, ApiErrorBody
      health.ts                   # HealthDto, HealthStatus
    test/
      setup.ts                    # @testing-library/jest-dom + cleanup
```

### 7.2 Dependencies

- Runtime: `react`, `react-dom`.
- Dev: `vite`, `@vitejs/plugin-react`, `typescript`, `eslint`, `@eslint/js`,
  `typescript-eslint`, `globals`, `eslint-plugin-react-hooks`,
  `eslint-plugin-react-refresh`, `vitest`, `@vitest/coverage-v8`, `jsdom`,
  `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`.

No HTTP client library (native `fetch`), no router, no state library — see ADR 0002.

### 7.3 Types (frozen)

```ts
// src/types/health.ts
export type HealthStatus = 'ok';

export interface HealthDto {
  status: HealthStatus;
  service: string;
  apiVersion: string;
}

// src/types/api.ts
export interface ApiErrorBody {
  detail: string;
}

export type RequestState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string };
```

`RequestState<T>` is the shared shape for every remote flow in the project. Because
the union is discriminated, the page cannot render a success branch without data, and
no `any` is ever needed.

### 7.4 API boundary (frozen)

`src/api/client.ts` is the **only** module allowed to call `fetch`.

```ts
export class ApiError extends Error {
  constructor(readonly status: number, readonly detail: string) { super(detail); }
}

export async function apiGet<T>(path: string): Promise<T>;
```

Rules:

- request URL is relative: `` `/api${path}` `` — never an absolute origin (ADR 0002);
- sends `Accept: application/json`;
- on `response.ok`, parses and returns the JSON body typed as `T`;
- on a non-2xx response, reads `{"detail": string}` and throws
  `new ApiError(response.status, detail)`; when the body is missing or is not JSON,
  falls back to `Le service a renvoyé une réponse inattendue.`;
- on a thrown `fetch` (network failure, proxy target down), throws
  `new ApiError(0, "Impossible de contacter le serveur.")`.

`src/api/health.ts` exposes exactly `export const fetchHealth = (): Promise<HealthDto> => apiGet<HealthDto>('/health');`

`src/hooks/useHealth.ts` exposes
`useHealth(): { state: RequestState<HealthDto>; reload: () => void }`. It fetches on
mount, exposes `reload` for the « Réessayer » button, maps `ApiError.detail` into
`state.message`, and ignores a resolved response after unmount (cancellation flag).

### 7.5 Health screen — frozen French copy

`HealthPage` renders `<h1>État de l'API</h1>` and exactly one state block.

| State | Element / role | Frozen French text |
|---|---|---|
| Loading | `role="status"` | `Vérification de l'état de l'API…` |
| Success | `role="status"`, heading | `API disponible` |
| Success | detail lines | `Service : {service}` and `Version : {apiVersion}` |
| Error | `role="alert"`, heading | `API indisponible` |
| Error | description | the `ApiError` detail (already French) |
| Error | `<button type="button">` | `Réessayer` |

Accessibility and rule compliance:

- status is conveyed by **text**, never by colour alone (`react-dont`);
- the retry control is a real `<button>`, keyboard reachable, with a visible
  `:focus-visible` outline;
- `StatusMessage` is pure presentation (`tone: 'pending' | 'success' | 'danger'`,
  `title`, `description?`, `action?`); it holds no fetch logic.

**On the "empty" state**: a single-resource health probe has no empty case — the
response either exists or the call failed. The three states rendered here are
loading / success / error. The empty state becomes mandatory from US-001 onward
(profile list, missions list, calendar), and `StatusMessage` is already shaped to
serve it.

### 7.6 Tooling configuration (must be active, not decorative)

**`vite.config.ts`**

```ts
server: {
  port: 5173,
  proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
},
test: {
  environment: 'jsdom',
  globals: true,
  setupFiles: ['./src/test/setup.ts'],
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/main.tsx', 'src/vite-env.d.ts', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
    thresholds: { lines: 70, statements: 70, functions: 70, branches: 70 },
  },
},
```

**`package.json` scripts** (names are fixed — `AGENT.md` and the agent checklists refer
to them):

| Script | Command |
|---|---|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` (type check is part of the build) |
| `preview` | `vite preview` |
| `test` | `vitest run` |
| `test:coverage` | `vitest run --coverage` |
| `lint` | `eslint .` |

**`eslint.config.js`** — flat config over `js.configs.recommended` +
`tseslint.configs.recommended` + `reactHooks.configs['recommended-latest']`, with the
two mandatory rules stated explicitly so they cannot silently drop to `warn`:

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/ban-ts-comment': 'error',
}
```

`react-dev` must prove enforcement: temporarily introduce `const x: any = 1;`, run
`npm run lint`, observe the **error**, then remove it. ADR 0003 records why ESLint was
chosen over oxlint.

**`tsconfig.app.json`** — `"strict": true`, `"noUnusedLocals": true`,
`"noUnusedParameters": true`, `"noFallthroughCasesInSwitch": true`,
`"jsx": "react-jsx"`, `"types": ["vitest/globals"]`.

---

## 8. Testing strategy and responsibilities

### 8.1 Backend (`fastapi-dev`) — pytest, httpx, pytest-cov

`pyproject.toml`:

```toml
[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "--cov=app --cov-report=term-missing --cov-fail-under=70"
```

| Test file | Responsibility (one test per bullet, named explicitly) |
|---|---|
| `tests/conftest.py` | `client` fixture: `TestClient(create_app(), raise_server_exceptions=False)`. No DB fixture is needed for `/api/health`. |
| `tests/test_health_api.py` | `200` status; exact body `{"status": "ok", "service": "cra-api", "apiVersion": "0.1.0"}`; `content-type` is `application/json`; the response contains **no** `api_version` snake_case key; the call succeeds **without** an `X-Demo-User` header; `POST /api/health` returns `405` with the French detail. |
| `tests/test_error_contract.py` | unknown path `GET /api/inconnu` → `404` + `{"detail": "Ressource introuvable."}`; a French `HTTPException` detail raised by application code is preserved verbatim; a `422` from a validation failure is a **string** (not a list) starting with `Données invalides` and naming the faulty camelCase field; an unhandled exception → `500` + `{"detail": "Une erreur interne est survenue."}` with no traceback in the body. For the `422`/`500` cases, register throwaway routes **inside the test module** on an app built by `create_app()` — no test-only route may exist in `app/`. |
| `tests/test_schemas_common.py` | a `CamelModel` subclass with a `snake_case` field serialises to `camelCase` via `model_dump(by_alias=True)`; it validates input given by alias; it validates input given by Python field name (`populate_by_name`); `model_json_schema` exposes the alias. |

Lint gate: `uv run ruff check .` (and `ruff format --check .`) must pass. Ruff config
in `pyproject.toml`: `line-length = 100`, `target-version = "py312"`,
`lint.select = ["E", "F", "I", "UP", "B"]`.

### 8.2 Frontend (`react-dev`) — Vitest, Testing Library, V8

Tests query by accessible role and by French text. `fetch` is stubbed at the boundary
with `vi.stubGlobal('fetch', …)`; components are never given a mocked module they own.

| Test file | Responsibility |
|---|---|
| `src/api/client.test.ts` | returns the parsed typed body on `200`; throws `ApiError` carrying `status` and the French `detail` on `500`/`404`; falls back to `Le service a renvoyé une réponse inattendue.` when the error body is not JSON; throws `ApiError(0, "Impossible de contacter le serveur.")` when `fetch` rejects; requests the relative `/api/...` URL. |
| `src/api/health.test.ts` | `fetchHealth()` calls `/api/health` and returns the `HealthDto`. |
| `src/hooks/useHealth.test.tsx` | starts in `loading`; transitions to `success` with the DTO; transitions to `error` with the French message; `reload()` re-issues the request. |
| `src/components/StatusMessage.test.tsx` | renders title and description; renders the action button only when provided; exposes `role="alert"` for the danger tone and `role="status"` otherwise. |
| `src/pages/HealthPage.test.tsx` | shows `Vérification de l'état de l'API…` while pending; shows `API disponible`, the service and the version on success; shows `API indisponible`, the French detail and a « Réessayer » button on error; clicking « Réessayer » refetches and reaches the success state. |

Gates: `npm test`, `npm run test:coverage` (≥ 70 on lines, statements, functions,
branches), `npm run lint`, `npm run build`.

### 8.3 Browser verification (end of phase, `react-dev`)

1. Start the backend: `cd backend && uv run uvicorn app.main:app --reload` → verify
   `http://localhost:8000/api/health` returns the frozen JSON and `/docs` lists the
   endpoint.
2. Start the frontend: `cd frontend && npm run dev`.
3. Open `http://localhost:5173` — the French success state is displayed, and the
   network panel shows a same-origin `GET /api/health` returning `200`
   (proxy is working; no CORS request).
4. Stop the backend, click « Réessayer » → the French error state is displayed and the
   console shows no unhandled rejection.
5. Restart the backend, click « Réessayer » → back to the success state.
6. Check the accessibility snapshot, keyboard focus on « Réessayer », and the layout at
   375 px.

---

## 9. Implementation split

Both agents can start **immediately and in parallel**: the contract in §5, §6 and §7.3
is sufficient for the frontend to be written and tested against stubbed `fetch`
without a running backend.

| Item | `fastapi-dev` | `react-dev` |
|---|---|---|
| `backend/**` (all files in §4.1) | ✅ owns | ❌ never |
| `frontend/**` (all files in §7.1) | ❌ never | ✅ owns |
| `docs/**`, `specs/**`, `AGENT.md`, `PLAN.MD`, `.claude/**`, `.github/**`, `.specify/**`, `.mcp.json` | ❌ | ❌ |
| Root `.gitignore` / root config files | ❌ not created by anyone | ❌ |
| French API `detail` wording | ✅ owns (§6) | consumes, never rewrites |
| French UI wording | consumes | ✅ owns (§7.5) |
| `/api/health` shape | implements §5 | consumes §5 |
| Vite proxy | ❌ | ✅ owns |
| Browser verification | provides a running API | ✅ runs it |

Contract conflicts are escalated to `architect`; neither agent may unilaterally change
a field name, a status code or a message defined here, nor weaken a test to make an
implementation pass.

---

## 10. Acceptance traceability

| # | Phase 1 requirement (PLAN.MD / user prompt) | Where it is satisfied | How it is proven |
|---|---|---|---|
| A1 | `backend/` FastAPI + SQLAlchemy + SQLite with routers/services/models | §4.1, §4.3 | tree exists; `uvicorn` starts; `create_all` runs at startup |
| A2 | `frontend/` Vite + React + strict TypeScript with pages/components/typed API client | §7.1, §7.3, §7.4 | `npm run build` (includes `tsc -b`) passes |
| A3 | No business feature | §1.2 | only `routers/health.py`; `models/__init__.py` empty |
| A4 | One screen showing API state, three states, in French | §7.5 | `HealthPage.test.tsx` (loading / success / error / retry) |
| A5 | `CamelModel` in `schemas/common.py`, snake_case ↔ camelCase, populate by name | §4.3, ADR 0004 | `test_schemas_common.py`; `apiVersion` in `test_health_api.py` |
| A6 | `{"detail": "<phrase française>"}` on **all** non-2xx | §6 | `test_error_contract.py` (404, business detail, 422, 500) |
| A7 | Flattened Pydantic `422` | §6.1 handler 2 | `422` assertion: `detail` is a `str`, not a `list` |
| A8 | `500` handler on `Exception` | §6.1 handler 3 | `500` assertion, no traceback leaked |
| A9 | pytest-cov floor 70 | §8.1 | `--cov-fail-under=70` in `addopts`; run fails below the floor |
| A10 | Ruff | §8.1 | `uv run ruff check .` passes |
| A11 | Vitest V8 thresholds 70 | §7.6, §8.2 | `npm run test:coverage` fails below 70 |
| A12 | `no-explicit-any` + `ban-ts-comment` as **errors** | §7.6, ADR 0003 | `npm run lint`; temporary `any` produces an error |
| A13 | Vite `/api` proxy to `localhost:8000` | §7.6, ADR 0002 | network panel shows same-origin `/api/health` |
| A14 | Everything verified through `localhost:5173` | §8.3 | browser checklist, including backend-down retry |
| A15 | Frozen `/api/health` contract before implementation | §5 | this note, ADR 0001 |
| A16 | Forward-compatible with US-001 … US-017 | §3, §6.2 | health stays public without `X-Demo-User`; error shape already matches the `401/403/409/422` cases in the specs |

---

## 11. Handoff contract

> Frozen. Implement against this section without further design input.

### 11.1 To `fastapi-dev`

1. Create **only** the files listed in §4.1, under `backend/`.
2. Implement `GET /api/health` exactly as §5: `200`, `application/json`, body
   `{"status": "ok", "service": "cra-api", "apiVersion": "0.1.0"}`, public, no
   `X-Demo-User`, **no database access**.
3. Implement `CamelModel` in `app/schemas/common.py` as §4.3 and make every API schema
   inherit from it.
4. Implement the three exception handlers of §6.1, including the French default table
   and the `422` flattening algorithm, and register them in `create_app()`.
5. Wire SQLAlchemy + SQLite (`Base`, engine, `SessionLocal`, `get_db`) and call
   `Base.metadata.create_all` in the lifespan. Declare no model.
6. Write the tests of §8.1 **before** the production code; assert the exact frozen JSON.
7. Gates: `uv run pytest` (coverage ≥ 70, enforced by `--cov-fail-under=70`) and
   `uv run ruff check .` both pass.
8. Do not create a root `.gitignore`, a CI workflow, seed data, or any file outside
   `backend/**`.
9. Report: endpoint, exact payload, handler behaviour, coverage figure, lint result.

### 11.2 To `react-dev`

1. Create **only** the files listed in §7.1, under `frontend/`.
2. Consume `GET /api/health` through `apiGet<HealthDto>('/health')` using the relative
   `/api` prefix and the Vite proxy to `http://localhost:8000`. Never hardcode
   `http://localhost:8000` in `src/`.
3. Use the frozen types of §7.3 verbatim, and the frozen French copy of §7.5 verbatim.
4. Keep `fetch` inside `src/api/client.ts`; pages and components receive data through
   `useHealth`. No `any`, no `as any`, no `@ts-ignore`.
5. Configure the coverage thresholds and the two mandatory ESLint error rules of §7.6,
   and demonstrate that a deliberate `any` fails `npm run lint`.
6. Write the tests of §8.2; the frontend must be fully testable with a stubbed `fetch`
   and no running backend.
7. Gates: `npm test`, `npm run test:coverage` (≥ 70), `npm run lint`, `npm run build`
   all pass.
8. Perform the browser verification of §8.3 through `http://localhost:5173`, including
   the backend-down error state and the « Réessayer » recovery. If a server cannot be
   started, say so explicitly instead of simulating success.
9. Do not create any file outside `frontend/**`.

### 11.3 Shared, non-negotiable

- The response body of `GET /api/health` and every French UI/API string above are
  **frozen**; changing one requires an `architect` decision, not a local edit.
- Every non-2xx response is `{"detail": "<phrase française>"}` — no exception.
- Coverage floors and the two lint rules are **gates**, not advice.
- Any contract gap, ambiguity or conflict is escalated to `architect` before coding
  around it.

### 11.4 Definition of done for Phase 1 (first bullet)

Backend gates green, frontend gates green, both servers running, and
`http://localhost:5173` showing the French API state through the `/api` proxy — with
the error state and « Réessayer » demonstrated by stopping and restarting the backend.

---

## 12. Related decisions

| ADR | Title |
|---|---|
| [0001](../adr/0001-health-endpoint-semantics-and-error-boundary.md) | Health endpoint semantics and the centralised French error boundary |
| [0002](../adr/0002-frontend-api-boundary-and-vite-proxy.md) | Frontend API boundary and Vite `/api` dev proxy |
| [0003](../adr/0003-typescript-lint-enforcement.md) | ESLint as the enforced TypeScript lint gate |
| [0004](../adr/0004-camelcase-wire-contract.md) | camelCase wire contract via a shared `CamelModel` |
