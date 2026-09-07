---
name: tdd-tests
description: Écrire les tests d'une user story d'EnerFlex AVANT le code — tests de domaine (Vitest, fonctions pures), tests d'API (supertest sur createApp) et tests d'UI (Testing Library) — depuis le plan de l'architecte, avec des valeurs attendues calculées à la main. Utilisé par l'agent test-dev.
---

# Tests d'abord

Un test écrit avant le code décrit **la story**. Un test écrit après décrit **le code** — il
vérifie que l'implémentation fait ce qu'elle fait, ce qui ne prouve rien. C'est pourquoi
`test-dev` passe avant `node-dev` et `react-dev`, et pourquoi ses tests ne sont jamais
affaiblis ensuite.

## D'où viennent les valeurs attendues

**Du plan et de la story, calculées à la main.** Jamais en exécutant le code à tester. Le
calcul est écrit en commentaire au-dessus de l'assertion, pour que le relecteur le suive :

```ts
// souscrite 100 kVA, relevés 60 / 90 / 95 / 120 / 130 kW, grille : 2,85 €/kVA, 0,95 €/kWh
// P = 100 : 285 + 0,95 × (20 + 30)      = 332,50
// P =  90 : 256,5 + 0,95 × (5 + 30 + 40) = 327,75  ← minimum
// P =  80 : 228 + 0,95 × (10+15+40+50)   = 337,25
expect(resultat.puissanceRecommandeeKva).toBe(90)
expect(resultat.economieMensuelle).toBe(4.75)
```

## 1. Tests de domaine (`backend/tests/<regle>.test.ts`)

- Importer la fonction depuis le chemin fixé par le plan, même si le fichier n'existe pas
  encore : l'échec à l'import est le rouge attendu.
- Petits jeux de données : 3 à 6 relevés suffisent à exercer une règle. Construire les
  relevés avec un helper local `releve('2026-08-03T07:00:00', 120)`.
- Un `it` par règle et par cas limite : zéro, égalité, liste vide, résultat identique à
  l'existant.
- Utiliser la grille réelle (`import { GRILLE } from '../src/data/grille.js'`) sauf si le
  test a besoin de valeurs rondes — alors construire une grille locale et le dire.

```ts
describe('recommanderPuissance', () => {
  it('recommande la puissance qui minimise abonnement + pénalités', () => { … })
  it('renvoie la puissance actuelle et une économie nulle quand elle est déjà optimale', () => { … })
  it('en cas d’égalité de coût, retient la puissance la plus élevée', () => { … })
})
```

## 2. Tests d'API (`backend/tests/api.test.ts` ou un fichier par ressource)

```ts
import request from 'supertest'
import { createApp } from '../src/app.js'

const app = createApp()

it('GET /api/sites/LIL-02/optimisation renvoie la recommandation du mois', async () => {
  const res = await request(app).get('/api/sites/LIL-02/optimisation?mois=2026-08')
  expect(res.status).toBe(200)
  expect(res.body).toMatchObject({ siteId: 'LIL-02', mois: '2026-08' })
  expect(res.body.puissanceRecommandeeKva).toBeLessThan(res.body.puissanceSouscriteKva)
})

it('renvoie 404 avec un message français pour un site inconnu', async () => {
  const res = await request(app).get('/api/sites/XXX-99/optimisation')
  expect(res.status).toBe(404)
  expect(res.body).toEqual({ message: 'Site inconnu : XXX-99.' })
})
```

Un test par ligne du contrat : nominal (forme exacte), puis chaque erreur avec son message.
Sur les données de démo, préférer des assertions **relationnelles** (recommandé < souscrit
pour un site surdimensionné) aux valeurs absolues, que le générateur peut faire bouger.

## 3. Tests d'UI (`frontend/src/pages/<Page>.test.tsx`)

- `renderWithRouter` de `src/test/render.tsx`, fixtures de `src/test/fixtures.ts`.
- Mocker le module `src/api/…` (`vi.mock`), jamais `fetch`.
- Requêtes par rôle et libellé : `getByRole('button', { name: /acquitter/i })`,
  `findByText(/puissance recommandée/i)`.
- Trois états + interaction principale + cas métier particulier du plan.

```ts
it('affiche la puissance recommandée et l’économie mensuelle', async () => {
  getOptimisationMock.mockResolvedValue(optimisationLil02)
  renderWithRouter(<SiteDetailPage />, { route: '/sites/LIL-02' })
  expect(await screen.findByText(/puissance recommandée/i)).toBeInTheDocument()
  expect(screen.getByText('180 kVA')).toBeInTheDocument()
})
```

## Vérifier le rouge

```bash
npm test -w backend
npm test -w frontend
```

Les nouveaux tests échouent **pour la bonne raison** : module introuvable, assertion fausse.
Pas une faute de frappe, pas un import cassé. Les anciens restent verts. Le seuil de
couverture peut échouer à ce stade : c'est attendu, il sera regardé après implémentation.

## Checklist

- [ ] Un test nommé en français par ligne du plan de tests, plus un par critère oublié.
- [ ] Valeurs attendues calculées à la main, calcul en commentaire.
- [ ] Domaine : cas limites zéro / égalité / vide couverts.
- [ ] API : nominal + chaque erreur avec son message.
- [ ] UI : données / vide / erreur / interaction ; requêtes par rôle et libellé ; `api/` mocké.
- [ ] Suite rouge pour la bonne raison ; aucun fichier de production touché.
