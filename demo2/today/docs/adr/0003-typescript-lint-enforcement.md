# ADR 0003 — ESLint as the enforced TypeScript lint gate

- **Status**: Accepted
- **Date**: 2026-09-08
- **Deciders**: `architect`
- **Context document**: [design note 0001](../architecture/0001-project-scaffold.md)

## Context

`AGENT.md` and `.claude/rules/react-dont.md` forbid `any`, `as any` and `@ts-ignore`.
PLAN.MD Phase 1 makes the point sharper: the ban must be *actually applied by the
linter*, and it explicitly notes that oxlint does not enable these rules by default. A
rule that exists only in a documentation file is not a gate.

Two mandatory rules must be **active as errors** from the first commit:

- `@typescript-eslint/no-explicit-any`
- `@typescript-eslint/ban-ts-comment`

The user brief allows either oxlint or ESLint, provided the exact rules are active.

## Decision

Use **ESLint 9 flat config** with `typescript-eslint`, and declare the two rules
explicitly as `error` in `frontend/eslint.config.js`, even where a preset already sets
them — so that a preset upgrade cannot silently downgrade them to `warn`.

```js
export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, reactHooks.configs['recommended-latest']],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
);
```

Exposed as `npm run lint` → `eslint .`. `react-dev` must prove the gate: add
`const probe: any = 1;` temporarily, run `npm run lint`, observe the **error**, remove
it. TypeScript `strict` in `tsconfig.app.json` and `tsc -b` inside `npm run build`
remain the complementary type gate.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| **A. ESLint 9 + typescript-eslint (chosen)** | The two required rules exist natively and are the reference implementation; it is what `npm create vite@latest -- --template react-ts` scaffolds, so no fight with the generator; React Hooks rules (`rules-of-hooks`, `exhaustive-deps`) come from the same ecosystem and matter for the `useHealth` pattern; every agent and reviewer already knows the messages. | Slower than oxlint on large repositories (irrelevant at this size); flat-config migration knowledge required. |
| B. oxlint | Very fast; single binary. | The two mandatory rules are **not enabled by default**, which is exactly the trap PLAN.MD warns about, so a config file is required anyway; `ban-ts-comment` coverage and React Hooks rule parity are weaker; it would have to coexist with (or replace) the ESLint config Vite generates, adding a moving part for zero demo benefit. |
| C. Both (oxlint for speed, ESLint for correctness) | Fast feedback plus full rule set. | Two configurations to keep in sync, two failure sources, duplicate suppressions. Rejected as unnecessary complexity for a demo. |
| D. TypeScript compiler alone (`strict` + `tsc -b`) | No lint dependency. | `strict` does **not** forbid an explicit `any`, and it cannot see `@ts-ignore` — it obeys it. This option cannot satisfy the requirement at all. |

Note on typed linting: `typescript-eslint`'s type-aware preset
(`recommended-type-checked`) would add rules such as `no-unsafe-assignment`. It is
deliberately **not** enabled — it requires a `project`-aware parser configuration, slows
linting, and produces noise disproportionate to a demo scaffold. `no-explicit-any` plus
`strict` already close the practical escape hatches.

## Consequences

**Positive**

- `any` and `@ts-ignore` fail `npm run lint`, which is a listed gate in the `react-dev`
  completion checklist — the rule is enforced by tooling, not by reviewer goodwill.
- The config matches the Vite React-TS template, so the scaffold stays close to what any
  contributor expects.
- React Hooks lint rules protect the `useHealth` effect/cancellation pattern that every
  later screen will copy.

**Negative / accepted**

- One more dev dependency set (`eslint`, `@eslint/js`, `typescript-eslint`, `globals`,
  the two React plugins) and a slower lint than oxlint. Both are negligible here.
- Explicit rule duplication with the preset is intentional redundancy.

**Reversibility**

The lint gate is a single file plus one `package.json` script. Swapping in oxlint later
means writing an equivalent `.oxlintrc.json` with the same two rules as errors and
repointing `npm run lint`; no source file depends on the linter.
