# Backend Node / Express — Do / Don't

## Do

- Respecter les couches : `domain/` (règles pures) → `services/` (orchestration, état en
  mémoire) → `routes/` (parse, appelle, répond). Une règle métier vit dans `domain/`.
- Une fonction de domaine reçoit **tout** ce dont elle a besoin en paramètre (site, relevés,
  grille) et ne va rien chercher elle-même.
- Lever une erreur typée (`IntrouvableError`, `ConflitError`, `RequeteInvalideError`) depuis
  le service ; le middleware d'erreur la traduit en `{ message }` + statut HTTP.
- Messages d'erreur en **français**, phrases complètes, terminées par un point.
- Valider `mois` (`YYYY-MM`, dans la plage disponible) dans un helper unique réutilisé par
  toutes les routes.
- Exporter `createApp()` sans écoute réseau pour que supertest l'instancie.
- Un test par règle métier (unitaire, sur `domain/`) **et** un test par ligne du contrat
  d'API (supertest), y compris chaque erreur (400, 404, 409).

## Don't

- Pas de calcul tarifaire ni de détection d'alerte dans une route ou un service.
- Pas de montant stocké : facture et alertes sont dérivées à la lecture (ADR-0003).
- Pas de `Date.now()` / `new Date()` dans le domaine : la date est une entrée.
- Pas de base de données, pas de fichier écrit : l'état mutable est un `Set`/`Map` en mémoire (ADR-0002).
- Pas de `res.json()` d'un objet interne non typé : chaque réponse a un type dans `types.ts`.
- Pas de test qui reproduit le calcul de l'implémentation pour vérifier le résultat : le
  test pose des valeurs calculées **à la main** dans son nom ou son commentaire.
