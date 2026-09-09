---
name: react-screen
description: Use when building or changing a CRA React screen, including routing, typed DTOs, API clients, hooks, remote states, forms, validation, and French user feedback.
---

# React screen

Follow the React Do/Don't rules in `.claude/rules/` or the identical
`.github/instructions/` files. This example implements the mission list from US-004.

## Layers

```text
src/types/dto.ts             API DTOs and closed values
src/api/client.ts            shared fetch wrapper and error mapping
src/api/missions.ts          typed mission endpoint functions
src/hooks/useMissions.ts     remote state orchestration
src/components/missions/     presentation components
src/pages/MissionsPage.tsx   route-level composition
```

Pages compose. Hooks orchestrate. API modules perform HTTP. Components render typed props.

## DTOs

```ts
export type CraStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED'

export type Mission = {
  id: number
  name: string
  client: string
  startDate: string
  endDate: string | null
  isClosed: boolean
}

export type MissionFilters = {
  client?: string
  closed?: boolean
}
```

DTO field names match the camel-case JSON contract. Do not duplicate them in a component.

## Typed HTTP client

```ts
export class ApiError extends Error {
  constructor(readonly status: number, message: string) {
    super(message)
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-User': currentUserId(),
      ...init?.headers,
    },
  })
  if (!response.ok) {
    const body: { detail?: string } = await response
      .json()
      .catch(() => ({ detail: 'Une erreur est survenue.' }))
    throw new ApiError(response.status, body.detail ?? 'Une erreur est survenue.')
  }
  return response.status === 204 ? (undefined as T) : response.json()
}
```

The backend `detail` is already French. Display it rather than replacing it with a vague
message.

## Endpoint function

```ts
export function listMissions(filters: MissionFilters): Promise<Mission[]> {
  const query = new URLSearchParams()
  if (filters.client) query.set('client', filters.client)
  if (filters.closed !== undefined) query.set('closed', String(filters.closed))
  return apiFetch(`/api/missions?${query}`)
}
```

## Data hook

```ts
export function useMissions(filters: MissionFilters) {
  const [missions, setMissions] = useState<Mission[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setStatus('loading')
    setError(null)
    try {
      setMissions(await listMissions(filters))
      setStatus('ready')
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'Une erreur est survenue.')
      setStatus('error')
    }
  }, [filters])

  useEffect(() => { void reload() }, [reload])
  return { missions, status, error, reload }
}
```

## Page: loading, error, and empty are mandatory

```tsx
export function MissionsPage() {
  const [filters, setFilters] = useState<MissionFilters>({})
  const { missions, status, error, reload } = useMissions(filters)

  if (status === 'loading') return <Spinner label="Chargement des missions…" />
  if (status === 'error') {
    return <ErrorBanner message={error ?? 'Une erreur est survenue.'} onRetry={reload} />
  }
  if (missions.length === 0) {
    return <EmptyState message="Aucune mission ne correspond à ces filtres." />
  }

  return (
    <Card title="Missions">
      <MissionFiltersBar value={filters} onChange={setFilters} />
      <MissionTable missions={missions} />
    </Card>
  )
}
```

Register the page in the existing router and expose navigation through a semantic link.

## Forms and labels

- Use controlled inputs and a typed form object.
- Validate immediately for usability, while treating backend validation as authoritative.
- Disable submit while pending and restore it on failure.
- Display `409` and `422` details next to the field or in an error toast.
- Centralize labels: `DRAFT` → `Brouillon`, `SUBMITTED` → `Soumis`,
  `APPROVED` → `Validé`, `CONGE_PAYE` → `Congé payé`.
- Format dates with `Intl.DateTimeFormat('fr-FR')`; never render an ISO date directly.

## Before considering the task complete

- [ ] Route and navigation expose the screen with an accessible French label.
- [ ] DTOs match the API contract and contain no `any`.
- [ ] No `fetch` exists outside `src/api/`.
- [ ] Loading, error, empty, and populated states are handled.
- [ ] Backend error details are visible to the user.
- [ ] Forms are controlled, validated, and safe against duplicate submission.
- [ ] Design-system components and tokens are reused.
- [ ] Visible labels are French and dates use `fr-FR`.
- [ ] Screen behavior has Testing Library coverage.
