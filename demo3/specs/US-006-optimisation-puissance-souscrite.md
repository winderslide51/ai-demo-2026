# US-006 — Recommander la puissance souscrite optimale d'un site

État : **À faire** — story jouée pendant la démo.
Prérequis : la fiche du site et sa facture, déjà livrées (voir `docs/SPEC-TECHNIQUE.md` §6).

## Contexte métier

L'abonnement mensuel d'un site est proportionnel à sa **puissance souscrite** (2,85 € par
kVA et par mois). Chaque kWh consommé, sur une heure, au-delà de cette puissance est
facturé en **pénalité de dépassement** (0,95 € par kWh).

Un site **surdimensionné** paie tous les mois un abonnement pour une puissance qu'il
n'utilise jamais. Un site **sous-dimensionné** paie des pénalités. Entre les deux, il existe
une puissance souscrite qui minimise la somme des deux. Aujourd'hui, l'énergie manager doit
la calculer à la main dans un tableur, site par site.

## Story

En tant qu'énergie manager, je veux voir, sur la fiche d'un site, la puissance souscrite qui
aurait minimisé ma facture du mois affiché, ainsi que l'économie correspondante, afin de
renégocier mon contrat sur les sites mal dimensionnés.

## Critères d'acceptation

- **CA-1** — Sur la fiche d'un site, un bloc « Optimisation de la puissance souscrite »
  affiche : la puissance souscrite actuelle (kVA), la puissance recommandée (kVA), le coût
  mensuel actuel, le coût mensuel avec la puissance recommandée, et l'économie mensuelle.
  Tous les montants sont HT.
- **CA-2** — Le « coût mensuel » d'une puissance souscrite est la somme de l'abonnement
  qu'elle entraîne et des pénalités de dépassement qu'elle aurait entraînées sur les
  relevés horaires du mois affiché, avec la grille tarifaire du contrat.
- **CA-3** — La puissance recommandée est celle dont le coût mensuel est le plus faible.
- **CA-4** — L'économie mensuelle est la différence entre le coût mensuel actuel et le coût
  mensuel recommandé, arrondie au centime.
- **CA-5** — Le bloc indique en toutes lettres le sens de la recommandation : « Réduire la
  puissance souscrite » ou « Augmenter la puissance souscrite ».
- **CA-6** — Le calcul est fait côté serveur et exposé par l'API ; le frontend n'effectue
  aucun calcul tarifaire.
- **CA-7** — Un site inconnu ou un mois hors plage renvoient les mêmes erreurs que la fiche
  du site (404 « Site inconnu : XXX. », 400 « Mois invalide … »).

## Exemple

Site souscrit à **100 kVA**. Sur le mois, cinq relevés horaires : 60, 90, 95, 120 et 130 kW
(les autres heures sont négligeables). Grille : 2,85 €/kVA, 0,95 €/kWh de dépassement.

| Puissance souscrite | Abonnement | Dépassement | Pénalité | Coût mensuel |
|---|---|---|---|---|
| 100 kVA (actuelle) | 285,00 € | 20 + 30 = 50 kWh | 47,50 € | **332,50 €** |
| 90 kVA | 256,50 € | 5 + 30 + 40 = 75 kWh | 71,25 € | **327,75 €** |
| 80 kVA | 228,00 € | 10 + 15 + 40 + 50 = 115 kWh | 109,25 € | 337,25 € |

Puissance recommandée : **90 kVA**. Économie mensuelle : 332,50 − 327,75 = **4,75 €**.
Sens : « Réduire la puissance souscrite ».

## Hors périmètre

- Modifier réellement la puissance souscrite du site (le contrat reste inchangé).
- Optimiser sur plusieurs mois ou sur l'année.
- Afficher la recommandation dans la liste des sites ou sur le tableau de bord.
- Prendre en compte un coût de changement de contrat.

## Note technique (indicative, non contractuelle)

Le calcul devrait être une règle de domaine pure, comme la facture, et être exposé par une
route dédiée du site pour le mois demandé. Les sites `LIL-02` (surdimensionné) et `LYO-01`
(sous-dimensionné) des données de démo doivent donner des recommandations de sens opposé.
