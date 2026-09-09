# ADR 0002 — Frontend API boundary and the Vite `/api` dev proxy

- **Status**: Accepted
- **Date**: 2026-09-08
- **Deciders**: `architect`
- **Context document**: [design note 0001](../architecture/0001-project-scaffold.md)

## Context

The React application must call the FastAPI backend during development, and every
manual and browser verification must happen through `http://localhost:5173`. Two
decisions follow:

1. **How does the browser reach the API?** Same-origin relative URLs proxied by Vite, or
   absolute URLs to `http://localhost:8000` with CORS enabled on the backend?
2. **What is the shape of the frontend API boundary?** A hand-written typed `fetch`
   wrapper, a library such as `axios`, a generated OpenAPI client, or a data-fetching
   library such as TanStack Query?

These choices are structural: they determine where the `X-Demo-User` header will be
injected from US-001 onwards, how errors surface in the UI, and whether components can
be tested without a running backend.

## Decision

### 1. Relative `/api/...` URLs through the Vite dev proxy — no CORS

`vite.config.ts`:

```ts
server: {
  port: 5173,
  proxy: { '/api': { target: 'http://localhost:8000', changeOrigin: true } },
}
```

The frontend never contains the string `http://localhost:8000` in `src/`. The backend
adds **no** `CORSMiddleware`.

### 2. One hand-written typed `fetch` wrapper, `src/api/client.ts`

It is the only module in `frontend/src` allowed to call `fetch`. It exposes
`apiGet<T>(path: string): Promise<T>` and an `ApiError { status, detail }`, and it maps
the frozen backend error contract (`{"detail": "<phrase française>"}`) into a
displayable French message, with two fallbacks:

- non-JSON or bodyless error response → `Le service a renvoyé une réponse inattendue.`
- rejected `fetch` (backend down, proxy target refused) → `ApiError(0, "Impossible de contacter le serveur.")`

Remote state is exposed to pages through hooks (`useHealth`) returning the shared
discriminated union `RequestState<T>` (`loading` | `success` | `error`). No HTTP client
library, no data-fetching library, no global state library.

## Options considered

### Question 1 — reaching the API

| Option | Pros | Cons |
|---|---|---|
| **A. Vite proxy + relative URLs (chosen)** | Browser sees a single origin: no CORS, no preflight, no cookie/`SameSite` surprises; no environment variable to set for the demo; the custom `X-Demo-User` header of US-001/US-002 needs no CORS allow-list; production builds served behind any reverse proxy keep working unchanged; PLAN.MD and `AGENT.md` mandate it. | The proxy hop hides real CORS behaviour that a production deployment might need; a proxy misconfiguration surfaces as an opaque network error (which the UI error state is designed to display). |
| B. `VITE_API_BASE_URL` + absolute URLs + `CORSMiddleware` | Frontend can point at any backend; closer to a split deployment. | Requires CORS configuration on the backend, including an explicit allow-list for the custom `X-Demo-User` header (a preflight per request); introduces an env file and a failure mode where a missing variable silently breaks the app; more moving parts for a demo. |
| C. Same-origin by serving the built SPA from FastAPI `StaticFiles` | One process, one origin, no proxy. | Kills the Vite dev server experience (HMR) or forces a rebuild for each change; couples backend to frontend build output. |

**A** is chosen: it is the smallest configuration that makes `localhost:5173` the single
verification surface, and it removes an entire class of demo-day failures. The option-B
escape hatch stays cheap: `apiGet` builds its URL in one place, so introducing a base
URL later is a one-line change plus a backend middleware.

### Question 2 — API boundary shape

| Option | Pros | Cons |
|---|---|---|
| **A. Hand-written `fetch` wrapper + hooks (chosen)** | Zero dependency; ~40 lines, fully covered by tests; exact control over the French error mapping; trivial to stub with `vi.stubGlobal('fetch', …)`; matches `react-do` ("HTTP calls in typed `src/api/` clients, remote data through hooks", "prefer `useState`/`useReducer` before external tools"); the natural place to inject `X-Demo-User` in US-001. | Cache, retries and deduplication must be written by hand if ever needed (not needed in this project). |
| B. `axios` | Interceptors, shorter code for bodies and errors. | A dependency for behaviour `fetch` already provides; its error object shape must still be mapped to the French contract; nothing gained for a demo. |
| C. TanStack Query | Caching, retries, request state machine for free. | A significant dependency and mental model for a scaffold with one endpoint; hides the loading/error transitions the stories require us to demonstrate explicitly; encourages implicit global state, which `react-dont` warns against. |
| D. Generated OpenAPI client (`openapi-typescript`, `orval`) | Types always match the backend. | Adds a generation step and a backend-must-be-running coupling to the frontend build; generated error types would not carry the French `detail` contract without post-processing; too much machinery for 17 small endpoints. |

## Consequences

**Positive**

- The frontend is fully testable without a backend: stubbing `fetch` is enough, so
  `react-dev` can work in parallel with `fastapi-dev` from the frozen contract alone.
- One place — `src/api/client.ts` — owns URL construction, headers, JSON parsing and
  error translation. US-001 adds the `X-Demo-User` header there and nowhere else.
- No CORS configuration exists to be mis-set on demo day; a network panel showing a
  same-origin `/api/health` call is the proof the proxy works.
- `RequestState<T>` makes the loading/success/error triad structural, so a screen cannot
  forget a state without a type error.

**Negative / accepted**

- The dev proxy only exists in `vite dev`. A `vite preview` or a static deployment needs
  a proxy in front of it; documented here, not solved in Phase 1.
- Hand-written fetching means each new endpoint adds a small typed function — acceptable
  and explicit for 17 stories.

**Reversibility**

Switching to option B is a change to `apiGet`'s URL construction plus backend CORS.
Adopting TanStack Query later would wrap the existing `src/api/*` functions without
touching pages beyond their hook usage. Nothing in `pages/` or `components/` depends on
the transport.
