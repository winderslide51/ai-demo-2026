---
name: react-testing
description: Use when writing or fixing CRA frontend Vitest and Testing Library tests, including provider setup, accessible queries, API mocks, interactions, remote states, forms, and coverage.
---

# React testing

Follow the React Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files. Test user-visible behavior, not component internals.

## Vitest setup

```ts
// vite.config.ts
test: {
  environment: 'jsdom',
  setupFiles: './src/test/setup.ts',
  globals: true,
}
```

In `src/test/setup.ts`, import `@testing-library/jest-dom/vitest` and call
`afterEach(cleanup)`.

## Render with application providers

```tsx
export function renderWithProviders(ui: ReactNode, currentUser: DemoUser = jean) {
  return {
    user: userEvent.setup(),
    ...render(
      <MemoryRouter>
        <CurrentUserProvider value={currentUser}>{ui}</CurrentUserProvider>
      </MemoryRouter>,
    ),
  }
}
```

Add only providers the application actually uses. Keep the helper under `src/test/`.

## Query priority

1. `getByRole('button', { name: /soumettre/i })`
2. `getByLabelText(/commentaire/i)`
3. `getByText(/aucune mission/i)`
4. `getByTestId` only when no accessible query exists

Use `findBy*` for asynchronous appearance. Do not query CSS classes, DOM structure, or
React component state. Avoid arbitrary timeouts.

## Mock typed API modules

```tsx
vi.mock('../api/missions')
const listMissionsMock = vi.mocked(listMissions)
beforeEach(() => vi.resetAllMocks())
```

Mock the smallest `src/api/` boundary, not global `fetch`. This preserves the screen's
hook and state behavior while keeping tests deterministic.

## Simple component

```tsx
it('affiche le libellé français du statut', () => {
  render(<StatusBadge status="SUBMITTED" />)

  expect(screen.getByText('Soumis')).toBeInTheDocument()
})
```

## Screen with remote data

```tsx
it('affiche les missions retournées par l’API', async () => {
  listMissionsMock.mockResolvedValue([
    { id: 1, name: 'Refonte portail', client: 'ACME',
      startDate: '2026-01-05', endDate: null, isClosed: false },
  ])
  renderWithProviders(<MissionsPage />)
  expect(screen.getByText(/chargement des missions/i)).toBeInTheDocument()
  expect(await screen.findByText('Refonte portail')).toBeInTheDocument()
})
```

## Empty and error states

```tsx
it('affiche un message quand aucune mission ne correspond', async () => {
  listMissionsMock.mockResolvedValue([])
  renderWithProviders(<MissionsPage />)
  expect(await screen.findByText(/aucune mission/i)).toBeInTheDocument()
})

it('affiche le message d’erreur du backend', async () => {
  listMissionsMock.mockRejectedValue(new ApiError(403, 'Action réservée aux managers.'))
  renderWithProviders(<MissionsPage />)
  expect(await screen.findByText('Action réservée aux managers.')).toBeInTheDocument()
})
```

## Form interaction

```tsx
it('exige un commentaire avant de refuser un CRA', async () => {
  const { user } = renderWithProviders(<RejectCraModal open craId={7} />, paul)
  await user.click(screen.getByRole('button', { name: /refuser/i }))
  expect(await screen.findByText(/commentaire obligatoire/i)).toBeInTheDocument()
  expect(rejectCraMock).not.toHaveBeenCalled()
})
```

Assert both visible feedback and whether the API was called. Use `userEvent`, not
`fireEvent`, for realistic focus, typing, and click behavior.

## Minimum behavior per screen

- initial loading feedback;
- populated rendering from an API result;
- explicit empty state;
- backend error message and retry when provided;
- main story interaction, such as submit, approve, reject, or add entry;
- role-dependent visibility where the story defines it;
- disabled/pending behavior that prevents duplicate submissions.

## Coverage

```ts
// vite.config.ts
test: {
  coverage: {
    provider: 'v8',
    include: ['src/**/*.{ts,tsx}'],
    exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/main.tsx'],
    thresholds: { lines: 70, functions: 70, branches: 70, statements: 70 },
  },
}
```

```text
npm run test:coverage
```

Cover behavior-heavy modules first: the API client, hooks, form branches, and the three
remote states. Coverage is a floor, not a substitute for assertions about CRA rules.

## Before considering the task complete

- [ ] Queries use accessible roles, names, labels, or visible text.
- [ ] API modules are mocked instead of `fetch`.
- [ ] Async expectations use `findBy*` or condition-based `waitFor`.
- [ ] Loading, populated, empty, and error states are covered.
- [ ] Main interactions use `userEvent` and verify visible feedback.
- [ ] Role-dependent and duplicate-submit behavior are tested when relevant.
- [ ] Coverage thresholds are all at least 70%.
- [ ] `npm run test:coverage` passes.
