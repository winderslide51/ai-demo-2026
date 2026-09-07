# ADR-0003 — Facture et alertes dérivées à la lecture, jamais stockées

Statut : Acceptée — 2026-09-07

Contexte : la facture et les alertes sont des fonctions des relevés et de la grille. Les
stocker obligerait à les recalculer à chaque changement de grille ou de relevé, et à gérer
la dérive entre les deux.

Décision : `GET /api/sites/:id/facture` et `GET /api/alertes` calculent à chaque appel.
Seul l'acquittement d'une alerte est un état, rattaché à un identifiant d'alerte **stable**
(`${siteId}-${mois}-${type}`) pour survivre au recalcul.

Conséquences : une seule source de vérité ; une story qui change une règle change les
chiffres partout, immédiatement. Coût : calcul sur 744 relevés par site et par appel —
négligeable à l'échelle de la démo.

Alternatives considérées : cache par mois (inutile à cette échelle) ; table d'alertes
persistées avec job de détection (rejeté : complexité sans valeur pour la démo).
