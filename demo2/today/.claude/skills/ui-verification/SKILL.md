---
name: ui-verification
description: Use when verifying the running CRA application in a real Chrome browser, including accessibility snapshots, interactions, console errors, network calls, responsive layout, roles, and screenshots.
---

# UI verification with Chrome DevTools MCP

Follow the React and Python Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files when classifying findings. Vitest checks components in
jsdom; this skill checks the running application, Vite proxy, identity header, payloads,
CSS, console, and browser behavior.

## Prerequisites

Start both applications:

```text
cd backend
uv run uvicorn app.main:app --reload

cd frontend
npm run dev
```

Drive `http://localhost:5173`, not port 8000, so the `/api` proxy is part of the test.
Confirm the Chrome DevTools MCP server is available before beginning.

## Required browser loop

1. `navigate_page` to the screen under test.
2. `take_snapshot` and read the accessibility tree before acting.
3. Use snapshot UIDs with `click`, `fill`, `fill_form`, `hover`, or `handle_dialog`.
4. `wait_for` visible text that proves the result; never use a fixed sleep.
5. `list_console_messages`; treat unexpected errors and warnings as findings.
6. `list_network_requests`; inspect every relevant `/api/...` request.
7. `take_screenshot` after the behavior is proven or when documenting a defect.

Do not click coordinates blindly. The accessibility snapshot is the behavioral evidence;
the screenshot is only the visual illustration.

## Verify every data-driven screen

- Observe loading, populated, empty, and error states rather than assuming they exist.
- Confirm all labels and feedback are French.
- Reject raw enums such as `SUBMITTED` and unformatted ISO dates such as `2026-03-02`.
- Confirm backend `detail` text is displayed for deliberate `4xx` responses.
- Check the role-dependent UI without treating hidden controls as authorization.
- Tab through controls; use Enter or Space; close dialogs with Escape.
- Use `resize_page` at 375 px and verify there is no page-level horizontal overflow.
- Confirm focus remains visible and returns to the trigger after closing a modal.

## Verify authorization at the API boundary

Hiding a manager button from Jean is necessary but not sufficient. Make a direct request
with Jean's `X-Demo-User` and expect `403`:

```powershell
curl.exe -i -X POST http://localhost:8000/api/missions `
  -H "X-Demo-User: 2" `
  -H "Content-Type: application/json" `
  -d '{"name":"Refonte portail","client":"ACME","startDate":"2026-01-05"}'
```

For ownership rules, another consultant's unavailable CRA should normally return `404`
to avoid revealing its existence. Record the status and French error payload.

## Force the three remote states

- Loading: throttle the network, reload, and snapshot the loading label.
- Empty: use filters or deterministic seed data that produce no rows.
- Error: stop the backend or block the request, then verify a French error and retry.

Restore the normal network and servers after each forced state.

## End-to-end CRA demo scenario

1. Select Jean, a consultant; the current CRA displays `Brouillon`.
2. Open the month and add mission time, including two half-day entries.
3. Attempt to exceed one day and observe the French rejection.
4. Submit the CRA; it displays `Soumis` and becomes read-only.
5. Select Paul, the manager; Jean's CRA appears in the pending list.
6. Reject it with a comment; Jean receives a notification and the CRA returns to draft.
7. As Jean, correct and resubmit; as Paul, approve it.
8. Export the PDF and confirm the final document has no provisional watermark.

At each step, capture the snapshot, expected visible label, relevant network request, and
console state.

## Finding format

```text
Screen: CRA rejection (US-016)
Action: click “Refuser” without entering a comment
Expected: “Commentaire obligatoire”; no API call
Observed: POST /api/cra/7/refuser returned 422; no message appeared
Evidence: accessibility snapshot, network request, screenshot
```

Include reproduction steps, expected behavior, observed behavior, and evidence. Route the
finding to `react-dev` or `fastapi-dev`; do not silently repair it during verification.

## Boundary with automated tests

- Keep service and authorization rules in pytest.
- Keep component states and interactions in Vitest.
- Use this skill for browser integration, proxy behavior, real CSS, console, network, and
  keyboard behavior.
- A clean screenshot with console errors is a failure.

## Before considering the task complete

- [ ] Both servers were reached through `localhost:5173`.
- [ ] Accessibility snapshots were read before interactions.
- [ ] Loading, populated, empty, and error states were observed.
- [ ] Console messages contain no unexpected error or warning.
- [ ] Relevant API calls are successful or deliberate French `4xx` responses.
- [ ] Role restrictions were confirmed with direct API requests.
- [ ] Keyboard operation and 375 px layout were checked.
- [ ] Screenshots and reproducible findings were recorded for material results.
