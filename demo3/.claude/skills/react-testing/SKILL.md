---
name: react-testing
description: Écrire ou corriger des tests Vitest + Testing Library pour le frontend EnerFlex — rendu avec le routeur, requêtes accessibles, userEvent, mock du module api/, tests des états chargement / erreur / vide et des interactions, couverture 70 %.
---

# Tests React

Tester ce que l'utilisateur voit et fait, jamais l'implémentation.

## Outils fournis

- `src/test/setup.ts` — jest-dom, `cleanup`, mock de `ResizeObserver` (Recharts).
- `src/test/render.tsx` — `renderWithRouter(ui, { route })` : `MemoryRouter` + `Routes`.
- `src/test/fixtures.ts` — `synthese`, `sites`, `siteDetail`, `alertes` réalistes.

## Mocker le module `api/`, pas `fetch`

```tsx
vi.mock('../api/sites')
const getSiteMock = vi.mocked(getSite)

beforeEach(() => vi.resetAllMocks())
```

## Requêtes — dans cet ordre

1. `getByRole('button', { name: /acquitter/i })` — rôle + nom accessible
2. `getByLabelText(/sévérité/i)` — champs de formulaire
3. `getByText(/aucune alerte/i)` — contenu statique
4. `getByTestId` — dernier recours, à justifier

`findBy*` pour l'asynchrone ; jamais `waitFor` avec un délai arbitraire.

## Les trois états, à chaque écran

```tsx
it('affiche les sites retournés par l’API', async () => {
  getSitesMock.mockResolvedValue(sites)
  renderWithRouter(<SitesPage />, { route: '/sites?mois=2026-08' })
  expect(await screen.findByText('Usine de Vénissieux')).toBeInTheDocument()
})

it('affiche un message quand il n’y a aucun site', async () => {
  getSitesMock.mockResolvedValue([])
  renderWithRouter(<SitesPage />)
  expect(await screen.findByText(/aucun site/i)).toBeInTheDocument()
})

it('affiche le message d’erreur du backend', async () => {
  getSitesMock.mockRejectedValue(new ApiError(400, 'Mois invalide : attendu YYYY-MM entre 2026-03 et 2026-08.'))
  renderWithRouter(<SitesPage />)
  expect(await screen.findByText(/mois invalide/i)).toBeInTheDocument()
})
```

## Interaction

```tsx
it('acquitte une alerte et affiche la confirmation', async () => {
  const user = userEvent.setup()
  getAlertesMock.mockResolvedValue(alertes)
  acquitterMock.mockResolvedValue({ ...alertes[0], acquittee: true })

  renderWithRouter(<AlertesPage />)
  await user.click((await screen.findAllByRole('button', { name: /acquitter/i }))[0])

  expect(acquitterMock).toHaveBeenCalledWith(alertes[0].id)
  expect(await screen.findByRole('status')).toHaveTextContent('Alerte acquittée.')
})
```

Vérifier **à la fois** le retour visible et l'appel (ou le non-appel) de l'API.

## Couverture

Seuil **70 %** imposé dans `vite.config.ts` (lignes, fonctions, branches, instructions).
Couvrir d'abord ce qui porte du comportement : `api/client.ts`, les hooks, les états des
pages, `format.ts`. Un écran à 100 % dont la branche d'erreur n'est jamais rendue n'est pas
testé.

```bash
npm test -w frontend
```

## Checklist

- [ ] Module `api/` mocké, `fetch` jamais.
- [ ] Requêtes par rôle / libellé ; `findBy*` pour l'asynchrone.
- [ ] Données / vide / erreur (message du backend) par écran.
- [ ] Interaction principale avec `userEvent`, assertion sur l'UI et sur l'appel API.
- [ ] Couverture ≥ 70 %, trous délibérés et connus.
