# Workflow — règles opérationnelles (auto-chargées)

Ces règles disent **comment on travaille** sur EnerFlex. Elles s'appliquent à toute
conversation, avec ou sans skill.

## Une story passe par les agents, jamais par la conversation principale

1. `business-analyst` relit la story et rend un verdict (`docs/revues/US-XXX-revue.md`).
2. `architect` écrit le plan (`docs/architecture/US-XXX-plan.md`) → **l'humain relit le plan.**
3. `test-dev` écrit les tests, qui échouent (rouge) → **l'humain relit les tests.**
4. `node-dev` (`backend/**`) et `react-dev` (`frontend/**`) implémentent jusqu'au vert.
5. `reviewer` relit le code (lecture seule) → **l'humain relit le code et la revue.**
6. `tech-writer` produit le rapport de livraison et met à jour `docs/SPEC-TECHNIQUE.md`.

Le skill `implement-us` enchaîne ces étapes et **s'arrête à chaque porte humaine**. Ne jamais
franchir une porte humaine sans l'accord explicite de l'utilisateur.

## Un agent, un dossier

- `business-analyst` : écrit uniquement dans `docs/revues/`.
- `architect` : écrit uniquement dans `docs/architecture/` et `docs/adr/`.
- `test-dev` : écrit uniquement des fichiers `*.test.ts` / `*.test.tsx` (et les fixtures de test).
- `node-dev` : `backend/**` hors tests existants ; `react-dev` : `frontend/**` hors tests existants.
- `reviewer` : n'écrit rien sauf son rapport dans `docs/revues/`.
- `tech-writer` : `docs/rapports/` et `docs/SPEC-TECHNIQUE.md`.
- Personne ne modifie `specs/` : les stories appartiennent au client. Une reformulation est
  une proposition, pas une correction appliquée.

## Les tests précèdent le code

- Les tests de `test-dev` sont écrits depuis la story et le plan, **avant** l'implémentation.
- Un test n'est **jamais affaibli** pour passer. Un test faux révèle un plan faux : on
  remonte à `architect`, on ne bricole pas l'assertion.
- Seuil de couverture : 70 % sur chaque côté, imposé par le runner. C'est un plancher, pas
  une cible : on couvre les règles métier, pas les getters.

## Briefer un agent

Un agent démarre sans le contexte de la conversation. Lui donner à chaque fois :
l'identifiant de la story, le chemin du plan (s'il existe), le chemin des tests (s'ils
existent), et le rappel de son dossier. Tout le reste est dans `AGENTS.md`, qu'il lit.

## Signaler un conflit, ne pas le résoudre en silence

Si une consigne contredit `AGENTS.md`, une règle ou un ADR accepté, le dire **avant** de
commencer et laisser l'utilisateur arbitrer. Un choix silencieux ressemble à un accord.
