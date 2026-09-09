# ADR 0004 — camelCase wire contract via a shared `CamelModel`

- **Status**: Accepted
- **Date**: 2026-09-08
- **Deciders**: `architect`
- **Context document**: [design note 0001](../architecture/0001-project-scaffold.md)

## Context

`AGENT.md` mandates `snake_case` in Python and `camelCase` in JSON and TypeScript. The
17 stories exchange multi-word fields (`userId`, `annee`, `mois`, `demiJournee`,
`dateSoumission`, `commentaireRefus`, `joursOuvres`…), so the casing boundary is
crossed on nearly every payload. The convention must be enforced **mechanically** from
the first schema: retrofitting aliases across 17 stories would break the frontend types
of every screen already built.

Phase 1 has exactly one payload, so this is the cheapest possible moment to pin the
mechanism — and `apiVersion` in `GET /api/health` is a deliberate probe: it is the one
field in the scaffold whose alias differs from its Python name.

## Decision

A single base class, `backend/app/schemas/common.py`:

```python
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
```

**Every** request and response schema in the project inherits from `CamelModel` — no
exception, including single-word payloads, so the rule never needs a judgement call.

- `alias_generator=to_camel`: the wire representation (JSON body **and** OpenAPI schema)
  is camelCase, derived automatically. No hand-written `Field(alias=...)`.
- `populate_by_name=True`: Python code can still build the model with its `snake_case`
  field names (`HealthResponse(api_version=...)`), which keeps services and tests
  readable, and lets FastAPI validate input by alias **or** by name.
- `from_attributes=True`: lets a response schema be validated from a service dataclass
  or a SQLAlchemy entity via `model_validate(obj)` without a manual field-by-field copy,
  while still forbidding returning ORM models directly from routers.

Consequence for the frozen contract: `HealthResponse.api_version` is serialised as
`"apiVersion"`, and the TypeScript `HealthDto` declares `apiVersion: string`. No mapping
layer exists on the frontend.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. Shared `CamelModel` base with `to_camel` alias generator (chosen)** | One line of inheritance enforces the convention; impossible to forget a field once the base is used; OpenAPI reflects the true wire shape, so generated docs and the frontend types agree; `populate_by_name` keeps Python ergonomics; explicitly required by `.claude/rules/python-do.md` ("inherit API schemas from the shared camel-case base model"). | A developer could still bypass it by inheriting `BaseModel` directly — mitigated by the rule files, review, and the `apiVersion` contract test that fails if the base is bypassed. |
| B. Per-field `Field(alias="apiVersion")` | Explicit and greppable; no shared base. | Repeated on every multi-word field of 17 stories; one forgotten alias is a silent contract break the frontend discovers as `undefined` at runtime; noisy schemas. |
| C. `snake_case` on the wire (no aliasing at all) | Zero backend machinery. | Violates `AGENT.md`; produces `api_version`/`date_soumission` in TypeScript, which fights the frontend ecosystem and its lint conventions; the mismatch would surface in every DTO of the project. |
| D. camelCase conversion in the frontend (a mapping layer per DTO) | Backend stays pure `snake_case`. | Hand-written mappers per endpoint, or a generic deep converter that erases types and would need `any` — directly forbidden by ADR 0003 and `react-dont`; the OpenAPI contract would still be `snake_case`, so documentation and reality diverge. |

## Consequences

**Positive**

- The wire contract is derived, not maintained: adding a field to a schema
  automatically yields the correct camelCase alias.
- Frontend DTOs mirror the JSON one-to-one; no adapter, no `any`, no drift.
- `test_schemas_common.py` pins the four behaviours (alias out, alias in, name in,
  alias in the JSON schema), and `test_health_api.py` asserts that `api_version` is
  **absent** from the response — so a bypass of `CamelModel` fails the build.

**Negative / accepted**

- Test and service code sometimes reads `api_version` while the payload says
  `apiVersion`; this dual naming is the intended, documented boundary.
- `from_attributes=True` on the shared base is slightly permissive; routers must still
  return schemas, never ORM entities (enforced by `.claude/rules/python-dont.md`).

**Reversibility**

The mechanism is one class. Changing the casing policy means changing one
`alias_generator`; every schema follows automatically. The frontend types would have to
be regenerated, which is exactly why the decision is taken now, while a single payload
exists.
