---
name: implement-us
description: Livrer une user story d'EnerFlex de bout en bout avec les agents du projet — revue BA, plan d'architecture, tests TDD, implémentation, revue de code, rapport et mise à jour de la spec technique — avec une porte humaine après chaque livrable. Lui donner un identifiant de story (US-006). C'est le workflow joué pendant la démo.
---

# Livrer une user story avec les agents

Entrée : un identifiant de story (`US-006`) ou le chemin de son fichier dans `specs/`.
Sortie : la story implémentée, testée, relue, documentée — et **trois moments où l'humain
a relu et validé** : le plan, les tests, le code.

Le principe : **chaque agent produit un livrable lisible, et l'humain le lit avant que le
suivant ne commence.** L'IA va vite ; c'est la relecture qui fait la qualité. Ne jamais
enchaîner deux étapes sans passer par la porte quand il y en a une.

```
business-analyst ──▶ architect ──▶ ⏸ humain ──▶ test-dev ──▶ ⏸ humain ──▶ node-dev + react-dev ──▶ reviewer ──▶ ⏸ humain ──▶ tech-writer
     revue             plan          relit         tests         relit        implémentation           revue        relit        rapport + spec
```

## Étape 0 — Cadrer (conversation principale, 1 minute)

1. Lire `specs/US-XXX-*.md` et `AGENTS.md`.
2. Extraire les critères d'acceptation dans une checklist : c'est la definition of done de
   toutes les étapes suivantes.
3. Relever le commit de départ : `git rev-parse --short HEAD` — le rapport final en a besoin.
4. Annoncer le plan en trois lignes et lancer l'étape 1.

**Ne jamais modifier `specs/`.** Si la story a besoin d'être changée, c'est l'humain qui le fait.

## Étape 1 — Revue du besoin (agent `business-analyst`)

Déléguer à `business-analyst` avec l'identifiant de la story. Il rend :
`docs/revues/US-XXX-revue.md` **+ son PDF**, et un verdict : **Prête**, **À clarifier** ou
**Non prête**.

| Verdict | Suite |
|---|---|
| Prête | passer à l'étape 2 |
| À clarifier | **poser les questions à l'utilisateur**, une par ligne, et attendre. Ses réponses font partie du besoin : les transmettre mot pour mot à `architect` à l'étape 2 (et proposer à l'utilisateur de les reporter lui-même dans `specs/`). |
| Non prête | s'arrêter ; l'utilisateur réécrit la story |

Pendant la démo, ce sont les questions du BA qui montrent qu'un agent **lit** au lieu
d'obéir. Les afficher telles quelles, sans les résumer.

## Étape 2 — Plan (agent `architect`) — puis ⏸ porte humaine n° 1

Déléguer à `architect` avec : l'identifiant, le chemin de la revue, les réponses de
l'utilisateur, **la liste des fichiers à lire** (les sections de la spec technique
concernées, le fichier de domaine et la page frontend les plus proches) et le rappel du
budget : **plan ≤ 150 lignes, ADR ≤ 30**. Sans cette liste et ce budget, l'étape prend deux
à trois fois plus de temps — c'est le temps mort le plus visible de la démo. Il rend
`docs/architecture/US-XXX-plan.md` (+ ADR si décision structurelle).

**Porte humaine.** Afficher le chemin du plan et un résumé en cinq lignes : la règle, la
route, l'écran, le nombre de tests prévus, les alternatives écartées. Puis **s'arrêter et
demander** : « Le plan est-il validé ? ». Ne pas lancer `test-dev` sans un oui.

Si l'utilisateur demande une modification, relancer `architect` avec la demande (il
modifie le plan) et repasser la porte.

## Étape 3 — Tests d'abord (agent `test-dev`) — puis ⏸ porte humaine n° 2

Déléguer à `test-dev` avec : l'identifiant, le chemin du plan, le rappel qu'il n'écrit que
des tests. Il rend les fichiers de test et le tableau critère → test → état.

Vérifier soi-même que la suite est **rouge pour la bonne raison** :

```bash
npm test -w backend ; npm test -w frontend
```

**Porte humaine.** Lister les fichiers de test créés avec, pour chacun, les noms des tests
(en français, ils se lisent comme la story). Puis **s'arrêter et demander** : « Les tests
décrivent-ils bien la story ? ». Ne pas lancer les développeurs sans un oui.

## Étape 4 — Implémentation (agents `node-dev` et `react-dev`, en parallèle)

Déléguer aux deux en même temps, chacun avec : l'identifiant, le chemin du plan, les
chemins des tests rouges de son côté, et le rappel de son dossier.

- `node-dev` : `backend/**` — domaine → service → route, jusqu'au vert.
- `react-dev` : `frontend/**` — types → api → hook → composant → page, jusqu'au vert.

Si un agent signale un test qu'il croit faux : **ne pas le laisser le modifier**. Trancher
avec le plan ; si le plan est en cause, relancer `architect` puis `test-dev` sur ce point.

Puis vérifier depuis la racine :

```bash
npm run typecheck && npm run lint && npm test
```

Tout doit être vert, couverture ≥ 70 % des deux côtés. Un échec est un arrêt, pas une
note de bas de page.

## Étape 5 — Revue de code (agent `reviewer`) — puis ⏸ porte humaine n° 3

Déléguer à `reviewer` avec l'identifiant, le chemin du plan et le commit de départ. Il rend
`docs/revues/US-XXX-revue-code.md` avec ses constats par sévérité.

- `BLOQUANT` : corriger via l'agent propriétaire du fichier, puis refaire l'étape 4 (vérif).
- `À CORRIGER` : corriger si c'est rapide, sinon lister dans le rapport.
- `SUGGESTION` : rapporter seulement.

Au plus deux tours. Si des bloquants survivent, s'arrêter et remonter à l'utilisateur.

**Porte humaine.** Présenter : critères couverts / total, tests passés / total, couverture,
constats par sévérité, et proposer `git diff --stat` pour la relecture du code. Puis
**s'arrêter et demander** : « Le code est-il validé ? ».

## Étape 6 — Clôture (agent `tech-writer`)

Déléguer à `tech-writer` avec l'identifiant, le commit de départ et les chemins de la revue,
du plan et de la revue de code. Il rend :

- `docs/rapports/US-XXX-rapport.md` + PDF (skill `delivery-report`) ;
- `docs/SPEC-TECHNIQUE.md` mis à jour (skill `tech-spec-update`), version incrémentée.

Puis committer avec un message qui référence la story :
`feat(enerflex): US-006 recommandation de puissance souscrite`.

Message final, dans cet ordre : critères couverts / total ; endpoint et écran livrés ;
tests et couverture ; constats laissés ouverts ; chemins du rapport et de la spec.

## Garde-fous

- Périmètre de la story seulement. Une bonne idée hors story va dans le rapport, pas dans le diff.
- Aucun agent n'écrit hors de son dossier ; personne n'écrit dans `specs/`.
- Les tests précèdent le code et ne sont jamais affaiblis.
- Les trois portes humaines sont obligatoires, même si tout semble évident.
- Ne pas committer tant qu'un `BLOQUANT` est ouvert.

## Checklist

- [ ] Story lue, critères extraits, commit de départ relevé.
- [ ] Revue BA rendue ; questions posées à l'utilisateur et réponses transmises.
- [ ] Plan écrit ; **validé par l'humain**.
- [ ] Tests écrits, rouges pour la bonne raison ; **validés par l'humain**.
- [ ] Backend et frontend implémentés par leur agent ; `typecheck`, `lint`, `test` verts, couverture ≥ 70 %.
- [ ] Revue de code rendue, aucun `BLOQUANT` ouvert ; **code validé par l'humain**.
- [ ] Rapport de livraison (md + PDF) et spec technique mis à jour ; commit fait.
