---
name: react-screen
description: Construire ou modifier un écran du frontend EnerFlex — DTO, fonction d'API, hook useRemote, composant de présentation, page avec les trois états, libellés français, formats fr-FR, design system. À utiliser pour tout travail sous frontend/src/.
---

# Écran React

Suivre `.claude/rules/react-frontend.md`. Fil rouge : ajouter un bloc à la page d'un site.

## Couches

```
src/types/dto.ts                 type Recommandation = { … }          ← miroir du contrat
src/api/sites.ts                 getOptimisation(id, mois)             ← une fonction par endpoint
src/hooks/useOptimisation.ts     useOptimisation(id, mois)             ← data / status / error / reload
src/components/OptimisationCard.tsx                                    ← présentation pure
src/pages/SiteDetailPage.tsx                                           ← composition + états
src/labels.ts                    tous les libellés                     ← français, centralisé
src/format.ts                    formatKwh, formatEuros, formatPct…    ← fr-FR
```

## API

```ts
// src/api/sites.ts
export function getOptimisation(id: string, mois: string): Promise<Recommandation> {
  return apiFetch<Recommandation>(`/sites/${id}/optimisation?mois=${mois}`)
}
```

`apiFetch` (dans `client.ts`) lit `{ message }` sur les erreurs et lève `ApiError(status,
message)`. Le message est déjà en français : on l'affiche tel quel.

## Hook

`useRemote` est générique : lui passer une fonction qui renvoie la promesse.

```ts
export function useOptimisation(id: string, mois: string) {
  return useRemote(() => getOptimisation(id, mois), [id, mois])
}
```

Il renvoie `{ data, status: 'loading' | 'ready' | 'error', error, reload }`.

## Composant de présentation

- Props typées, pas de fetch, pas de calcul métier (l'économie vient de l'API).
- Design system : `Card`, `KpiTile`, `Badge`, `Button`, `PowerGauge`… (`docs/design/DESIGN.md`).
- Libellés depuis `labels.ts`, nombres depuis `format.ts`.
- Un état signifié par la couleur l'est aussi par un texte ou une icône avec `aria-label`.

## Page — les états sont obligatoires

```tsx
const optimisation = useOptimisation(id, mois)

{optimisation.status === 'loading' && <Spinner label={labels.chargement} />}
{optimisation.status === 'error' && <ErrorBanner message={optimisation.error} onRetry={optimisation.reload} />}
{optimisation.status === 'ready' && optimisation.data && <OptimisationCard data={optimisation.data} />}
```

Le **cas métier « rien à recommander »** (économie nulle) est un quatrième état à traiter
explicitement avec son libellé, prévu par le plan.

## Libellés et formats

| Valeur | Affichage |
|---|---|
| `412380` kWh | « 412 380 kWh » (`formatKwh`) |
| `74213.5` € | « 74 213,50 € » (`formatEuros`) |
| `-12.4` % | « −12,4 % » (`formatPct`, signe explicite) |
| `2026-08` | « août 2026 » (`formatMois`) |
| `DEPASSEMENT_PUISSANCE` | « Dépassement de puissance » (`labels.alerteType`) |

## Vérifier

```bash
npm run typecheck -w frontend && npm run lint -w frontend && npm test -w frontend && npm run build -w frontend
```

Puis vérifier le proxy Vite au `curl` ; l'écran sera vu dans Chrome par le `reviewer`
(skill `ui-verification`, plugin Claude in Chrome).

## Checklist

- [ ] DTO ajouté, identique au contrat du plan.
- [ ] Une fonction d'API, un hook, aucun `fetch` ailleurs.
- [ ] Trois états + cas métier particulier gérés, message du backend affiché.
- [ ] Libellés dans `labels.ts`, formats fr-FR, aucune valeur brute à l'écran.
- [ ] Design system réutilisé, aucune couleur littérale.
- [ ] Tests de `test-dev` verts sans modification.
