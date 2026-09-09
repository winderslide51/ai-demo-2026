---
name: implement-us
description: Use when implementing one CRA user story end to end from specs/US-XXX through design, acceptance-first API tests, backend, frontend, verification, review, PLAN.MD update, and commit.
---

# Implement a user story

This optional workflow is interchangeable with Spec Kit or equivalent manual prompting.
The invariant is: **design first, API tests first, one owner per side, review before done**.

Follow all applicable Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files, plus the focused project skills for each step.

Input: a story ID such as `US-004`. Output: implemented, tested, browser-verified,
reviewed code, followed by the story's `PLAN.MD` checkbox and a story-scoped commit.

## Step 0: frame the story

1. Read `AGENT.md` and the full `specs/US-XXX-*.md`.
2. Extract every acceptance criterion into a working checklist.
3. Verify the declared prerequisite is implemented.
4. Inventory existing code, tests, notes, and ADRs; state the implementation scope.

Never edit `specs/`. If product behavior is ambiguous, run `story-readiness` and stop
before architecture. Do not silently encode assumptions.

## Step 1: freeze the design

Delegate design to `architect`. Require:

- domain model delta and enforcement location for each invariant;
- complete API contract: route, verb, request, response, status, error, and role;
- frontend structure and explicit trade-offs for structural decisions;
- design note and ADRs under `docs/`;
- work split between `fastapi-dev` and `react-dev`.

The API contract is the gate. Do not start production code while either side still guesses
payload fields, enum values, errors, or ownership semantics.

Example contract:

```text
POST /api/cra/{annee}/{mois}/soumettre
Role: CONSULTANT, owner only
Success: 200 CraRead
Conflict: 409 {"detail": "Ce CRA ne contient aucune saisie."}
```

## Step 2: write API tests first

Assign `fastapi-dev` to write one HTTP-boundary test per applicable criterion before
implementation. Cover exact success payloads, stated business failures, wrong role (`403`), another
user's unavailable resource (`404`), and French `detail` errors.

```python
def test_submit_cra_when_empty_returns_409(as_jean: TestClient) -> None:
    response = as_jean.post("/api/cra/2026/3/soumettre")

    assert response.status_code == 409
    assert response.json()["detail"] == "Ce CRA ne contient aucune saisie."
```

Run the test and confirm it fails for missing behavior. Never weaken an acceptance test to
match an implementation. A contract error returns to `architect`; a product ambiguity
returns to the story author.

## Step 3: implement backend and frontend

Once the contract is stable, run the owners in parallel when practical:

- `fastapi-dev`, scoped to `backend/**`: model → schemas → service → repository → router,
  using `fastapi-endpoint`, `fastapi-data-model`, and `fastapi-testing`;
- `react-dev`, scoped to `frontend/**`: DTO → API client → hook → components → page,
  using `react-screen`, `react-design-system`, and `react-testing`.

Backend business rules remain in services. Frontend components never become an
authorization boundary. Do not use mock production data to bypass a missing endpoint.

After the acceptance tests pass, add focused unit and component tests for behavior until
both coverage floors are met.

## Step 4: automated verification

Run the repository's existing checks:

```text
cd backend
uv run pytest
uv run ruff check .

cd frontend
npm run test:coverage
npm run build
npm run lint
```

Both coverage configurations must enforce at least 70%. If coverage is low, test an
uncovered rule or branch; do not pad the suite with trivial getters.

Walk the extracted acceptance checklist and map each item to a passing test or explicit
browser check.

## Step 5: browser verification

Start backend and frontend, then apply `ui-verification` through the Vite URL:

- execute the main path and relevant loading, empty, and error states;
- inspect console messages, `/api` requests, French labels, dates, and backend errors;
- verify keyboard use and the 375 px layout;
- confirm role restrictions with a direct API request, not only hidden UI;
- capture evidence for material results.

Automated suites do not prove the proxy, `X-Demo-User`, real CSS, or browser integration.

## Step 6: review

Delegate the story, design, and diff to `cra-reviewer`.

- Fix every `BLOQUANT` through the owning developer, then repeat verification.
- Fix cheap `À CORRIGER` findings now; report any deliberately deferred item.
- Record `SUGGESTION` findings without expanding scope.
- Limit the review/fix loop to two rounds.

If a blocker survives two rounds, stop and report it rather than continuing speculative
patches.

## Step 7: close

Only after all gates pass:

1. Tick the story checkbox in `PLAN.MD`.
2. Review the final diff for story scope and accidental files.
3. Commit with the story ID, for example:

```text
feat(cra): implement US-004 mission list
```

4. Report criterion-to-test mapping, changed endpoints and screens, all verification
   results, open findings, assumptions, and what the next story receives.

## Guardrails

- Do not anticipate later stories or edit a story to make implementation easier.
- Do not let an agent write outside its file scope.
- Do not put business rules in routers or React components.
- Do not treat hidden UI as authorization.
- Do not close or tick `PLAN.MD` with a failing check, missed coverage floor, or blocker.

## Before considering the task complete

- [ ] Story, prerequisite, and acceptance criteria were read and extracted.
- [ ] Readiness issues were resolved before design.
- [ ] API contract was frozen before production code.
- [ ] API acceptance tests were written and failed before implementation.
- [ ] Backend and frontend stayed within their ownership boundaries.
- [ ] Acceptance, unit, component, coverage, lint, and build checks pass.
- [ ] Coverage is at least 70% on both sides.
- [ ] The running story was verified with Chrome DevTools MCP.
- [ ] Review completed with no open `BLOQUANT`.
- [ ] `PLAN.MD` was ticked only after all gates passed.
- [ ] Final commit and report reference the story ID.
