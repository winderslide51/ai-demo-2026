---
name: react-design-system
description: Use when styling CRA screens or creating shared React UI components, design tokens, status and absence visuals, interaction states, accessible controls, or responsive layouts.
---

# CRA design system

Follow the React Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files. Shared components live in `src/components/ui/`; tokens
live in `src/styles/tokens.css`.

## Core tokens

```css
:root {
  --color-bg: #f7f8fa;
  --color-surface: #ffffff;
  --color-border: #e2e5ea;
  --color-text: #1a1d23;
  --color-text-muted: #5d6470;
  --color-primary: #2f5bea;
  --color-primary-hover: #2448c4;
  --color-success: #1a7f52;
  --color-warning: #9a5d00;
  --color-danger: #b42318;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-6: 24px;
  --space-8: 32px;
  --radius: 8px;
  --shadow-card: 0 1px 3px rgb(16 24 40 / 8%);
  --font-sans: Inter, system-ui, sans-serif;
}
```

Use a 12/14/16/20/28 px type scale. Body text is 14 px; page titles are 28 px.

## CRA status presentation

| Value | French label | Token |
|---|---|---|
| `DRAFT` | Brouillon | `--color-text-muted` |
| `SUBMITTED` | Soumis | `--color-warning` |
| `APPROVED` | Validé | `--color-success` |

Rejection returns the CRA to `DRAFT`; show the rejection comment separately.

## Calendar entry presentation

Every type has text as well as color:

| Value | Label | Background |
|---|---|---|
| `MISSION` | client name | `#e7edfd` |
| `CONGE_PAYE` | CP | `#e3f6ec` |
| `RTT` | RTT | `#e8f4f8` |
| `MALADIE` | Maladie | `#fdeaea` |
| `SANS_SOLDE` | Sans solde | `#f2f0f5` |
| `FORMATION` | Formation | `#fff4e0` |
| non-working day | Indisponible | `#eff1f4` |

Move these literals into named domain tokens before using them in components.

## Shared components

| Component | Required behavior |
|---|---|
| `Button` | primary/secondary/danger variants, loading and disabled states |
| `StatusBadge` | color plus French label from `src/labels.ts` |
| `Card` | title, actions, content, surface and shared spacing |
| `Modal` | focus trap, Escape close, focus restoration |
| `DataTable` | accessible headers and explicit empty message |
| `Toast` | success/error semantics, dismiss button, polite live region |
| `Spinner` | French accessible loading label |
| `EmptyState` | actionable empty explanation |
| `ErrorBanner` | backend message and optional retry action |

Example status badge:

```tsx
const statusLabels: Record<CraStatus, string> = {
  DRAFT: 'Brouillon',
  SUBMITTED: 'Soumis',
  APPROVED: 'Validé',
}

export function StatusBadge({ status }: { status: CraStatus }) {
  return <span className={`status status--${status.toLowerCase()}`}>{statusLabels[status]}</span>
}
```

## Interaction states

Define `hover`, `focus-visible`, `active`, and `disabled` for every interactive control:

```css
.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
```

Never remove a focus outline without an equally visible replacement.

## Accessibility

- Maintain at least 4.5:1 contrast for normal text.
- Associate every input with a visible French `<label>`.
- Give icon-only buttons a French `aria-label`.
- Implement calendar days as buttons inside a table when editable.
- Give modals `role="dialog"`, `aria-modal="true"`, and a labelled title.
- Ensure Tab, Enter, Space, and Escape provide the expected keyboard behavior.
- Use live regions for asynchronous success or error messages.

## Responsive layout

- Limit main content to 1200 px and use tokenized grid gaps.
- Switch multi-column forms and cards to one column below 768 px.
- At 375 px, keep actions reachable and prevent page-level horizontal overflow.
- Let the monthly calendar use a labelled horizontal scroll region instead of crushing cells.

## Before considering the task complete

- [ ] Components use named tokens rather than screen-level color or spacing literals.
- [ ] Statuses and entry types communicate with text as well as color.
- [ ] Hover, focus-visible, active, loading, and disabled states are implemented.
- [ ] Inputs, icon buttons, dialogs, tables, and live messages are accessible.
- [ ] Keyboard-only operation works for the complete interaction.
- [ ] Layout is readable at 1280 px and 375 px.
- [ ] Shared components are reused instead of duplicated.
