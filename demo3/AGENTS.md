# AGENTS.md — EnerFlex project memory

**EnerFlex** is a small B2B portal for an industrial customer of an energy supplier.
The customer (« Valmont Industries », fictional) operates **12 sites** in France. The portal
shows each site's electricity consumption, computes the monthly invoice from the contract's
tariff grid (peak / off-peak hours, subscribed power, overage penalties) and raises alerts.

This is a **demo project**: it exists to show how a team of AI agents delivers a user story
on an existing codebase in 2026. The functional scope is deliberately modest so that the
audience's attention goes to the agents, not to the features.

## Stack

| Side | Tech |
|---|---|
| Frontend | React 19, TypeScript (strict), Vite, React Router, Recharts |
| Backend | Node.js 22+, Express 5, TypeScript (strict), `tsx` for dev |
| Data | In-memory, deterministic seed (no database — nothing to install) |
| Tests | Vitest on both sides; supertest (backend), Testing Library (frontend); **70 % coverage floor** |

## Repository layout

```
AGENTS.md                 # this file — single source of truth for every assistant
PLAN.MD                   # the demo script (in French), step by step, with the prompts to paste
specs/                    # user stories in French — the customer's artefact
docs/SPEC-TECHNIQUE.md    # the technical specification of what is BUILT (kept up to date)
docs/architecture/        # one design note per story (written by `architect`)
docs/adr/                 # architecture decision records
docs/revues/              # story readiness reports (`business-analyst`) and code reviews (`reviewer`)
docs/rapports/            # delivery reports, one per story
backend/src/              # domain/ (pure business rules), services/, routes/, data/, app.ts, server.ts
backend/tests/
frontend/src/             # api/, types/, hooks/, components/, pages/, styles/
.claude/agents/           # business-analyst, architect, test-dev, node-dev, react-dev, reviewer, tech-writer
.claude/skills/           # implement-us (the workflow), plus one skill per practice
.claude/rules/            # Do / Don't rules, auto-loaded
.claude/hooks/            # token-tracker.mjs — writes reports/token-usage.md on Stop/SubagentStop
reports/token-usage.md    # token consumption per agent, per session, per story (generated)
```

## Conventions

- **Code, identifiers, comments, commit messages: English.**
- **Everything the end user reads (UI labels, error messages, documents): French.**
- Specs and docs are in French — they are read by the customer and the audience.
- **Business rules live in `backend/src/domain/` as pure functions** (no Express, no I/O) so
  they are testable in isolation. Services orchestrate; routes only parse and respond.
- The frontend never re-implements a tariff rule. It displays what the API returns.
- Money is handled in euros as `number` rounded to 2 decimals at the boundary (`arrondir2`).
- API errors: `{ "message": "<phrase en français>" }` with the proper HTTP status.

## Domain in one paragraph

A `Site` has a subscribed power (`puissanceSouscriteKva`) and an alert threshold. Its
consumption is a series of hourly readings (`kWh`), each tagged **HP** (heures pleines,
weekdays 6h–22h) or **HC** (heures creuses, nights and weekends). The **invoice** for a
month is: subscription (€/kVA) + HP energy + HC energy + excise + **overage penalty**
(every kWh drawn above the subscribed power in a given hour is billed a penalty rate)
+ VAT. **Alerts** are derived from the data: power overage, monthly threshold exceeded,
abnormal night-time consumption. Full rules and the API contract: `docs/SPEC-TECHNIQUE.md`.

## Commands

```bash
npm install                      # once, at the root (workspaces: backend + frontend)
npm run dev                      # both servers: API on :3001, UI on :5173 (proxy /api)
npm test                         # both test suites with coverage gates
npm run lint                     # both sides
npm run build                    # type-check + production build
```

## Working agreement

1. A story is delivered **through the agents**, in this order, with a human gate after each
   step that produces a document or code — see `.claude/skills/implement-us/SKILL.md`:
   `business-analyst` → `architect` → *(human reads the plan)* → `test-dev` → *(human reads
   the tests)* → `node-dev` + `react-dev` → `reviewer` → *(human reads the code)* →
   `tech-writer` (delivery report + technical spec update).
2. Each agent owns one folder; two agents never write to the same folder at the same time.
3. Tests are written **before** the implementation and are never weakened to pass.
4. A story is done when every acceptance criterion is covered, both suites are green above
   the coverage floor, the review has no `BLOQUANT` left, and `docs/SPEC-TECHNIQUE.md`
   describes what was built.
