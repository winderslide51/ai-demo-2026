# ADR-0001 — Règles métier en fonctions pures dans `backend/src/domain/`

Statut : Acceptée — 2026-09-07

Contexte : la tarification (HP/HC, abonnement, pénalités) et les alertes sont le cœur du
produit et ce que les stories futures feront évoluer. Elles doivent être testables sans
serveur, lisibles par un non-développeur, et impossibles à dupliquer côté UI.

Décision : chaque règle est une fonction pure de `backend/src/domain/` (entrées → sortie,
sans Express, sans horloge système, sans I/O). Les services orchestrent, les routes parsent.
Le frontend n'implémente aucune règle : il affiche ce que l'API renvoie.

Conséquences : tests unitaires rapides et exhaustifs ; un agent `test-dev` peut écrire les
tests d'une règle avant qu'elle n'existe ; une story qui change une règle touche un seul
fichier. Coût : un peu de plomberie entre domaine et services.

Alternatives considérées : règles dans les routes (rejeté : intestable sans HTTP) ; règles
partagées front/back dans un paquet commun (rejeté : surdimensionné pour la démo).
