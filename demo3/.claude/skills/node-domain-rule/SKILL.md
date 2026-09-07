---
name: node-domain-rule
description: Ajouter ou modifier une règle métier dans le backend EnerFlex — fonction pure dans backend/src/domain/, service d'orchestration, route Express 5 typée, erreurs françaises, validation du mois. À utiliser pour tout travail sous backend/src/.
---

# Ajouter une règle métier et son endpoint

Trois couches, une responsabilité chacune. Exemple fil rouge : la facture d'un site.

```
src/domain/tarification.ts     calculerFacture(site, mois, releves, grille): Facture   ← la règle, pure
src/services/factures.service.ts   factureDuSite(id, mois)                              ← charge, appelle, lève
src/routes/sites.ts            GET /api/sites/:id/facture                              ← parse, répond
```

## 1. Domaine — une fonction pure

```ts
// src/domain/optimisation.ts
import type { GrilleTarifaire, Releve, Site } from '../types.js'
import { arrondir2 } from './arrondi.js'

export type Recommandation = {
  puissanceSouscriteKva: number
  puissanceRecommandeeKva: number
  coutActuel: number
  coutRecommande: number
  economieMensuelle: number
}

export function recommanderPuissance(site: Site, releves: Releve[], grille: GrilleTarifaire): Recommandation {
  // 1. candidates  2. cost of each  3. pick the minimum  4. round at the boundary
}
```

Règles de la couche :

- **Tout en paramètre** : site, relevés, grille. Pas d'import de `data/`, pas de `Date`.
- **Réutiliser** les briques existantes : `plageDe`, `resumerConsommation`, `arrondir2`.
- **Arrondir à la sortie** seulement.
- Nommer le type de retour et l'exporter depuis `src/types.ts` s'il traverse l'API.

## 2. Service — orchestrer et lever

```ts
// src/services/optimisation.service.ts
import { IntrouvableError } from '../errors.js'

export function recommandationDuSite(siteId: string, mois: string): RecommandationDto {
  const site = trouverSite(siteId)              // throws IntrouvableError(`Site inconnu : ${siteId}.`)
  const releves = relevesDuSite(site.id, mois)  // generator, cached
  return { siteId: site.id, mois, ...recommanderPuissance(site, releves, GRILLE) }
}
```

Erreurs typées disponibles dans `src/errors.ts` :

| Classe | Statut | Quand |
|---|---|---|
| `RequeteInvalideError` | 400 | paramètre mal formé (`mois`) |
| `IntrouvableError` | 404 | site ou alerte inconnus |
| `ConflitError` | 409 | état incompatible (alerte déjà acquittée) |

Message : phrase française complète, terminée par un point.

## 3. Route — parser et répondre

```ts
// src/routes/sites.ts
router.get('/:id/optimisation', (req, res) => {
  const mois = moisDepuisRequete(req.query.mois)   // shared helper: default + validation → 400
  res.json(recommandationDuSite(req.params.id, mois))
})
```

- Express 5 propage les exceptions des handlers synchrones **et** asynchrones au middleware
  d'erreur : pas de `try/catch` dans la route.
- Le middleware d'erreur (`src/app.ts`) traduit les erreurs typées en `{ message }`.
- La réponse est typée par le contrat du plan (`src/types.ts`).

## 4. Vérifier

```bash
npm run typecheck -w backend && npm run lint -w backend && npm test -w backend
npm run dev -w backend   # puis, dans un autre terminal :
curl -s "http://localhost:3001/api/sites/LIL-02/optimisation?mois=2026-08"
```

## Checklist

- [ ] La règle est une fonction pure de `domain/`, sans I/O ni horloge.
- [ ] Le service lève des erreurs typées avec un message français.
- [ ] La route ne contient ni calcul ni `try/catch`.
- [ ] Le type de réponse est dans `src/types.ts` et identique au plan.
- [ ] `mois` validé par le helper partagé.
- [ ] Tests de `test-dev` verts sans modification ; couverture ≥ 70 %.
