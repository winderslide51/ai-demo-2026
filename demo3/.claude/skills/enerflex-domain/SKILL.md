---
name: enerflex-domain
description: Aide-mémoire du métier EnerFlex — vocabulaire de la fourniture d'électricité B2B (kWh, kW, kVA, HP/HC, puissance souscrite, dépassement, accise), grille tarifaire du contrat, formules de facture et d'alertes, sites de démo et leurs scénarios. À charger avant de lire ou d'écrire une story, un plan ou une règle de domaine.
---

# Le métier EnerFlex en une page

## Vocabulaire

| Terme | Définition | Unité |
|---|---|---|
| **Consommation** | énergie consommée sur une période | kWh |
| **Puissance** | énergie consommée par unité de temps ; sur un relevé horaire, `kWh sur 1 h = kW moyen` | kW |
| **Puissance souscrite** | puissance maximale contractuelle du site ; fixe la part d'abonnement | kVA (≈ kW dans la démo : facteur de puissance 1, simplification assumée) |
| **Heures pleines (HP)** | lundi–vendredi, 06:00 ≤ h < 22:00 — énergie plus chère | — |
| **Heures creuses (HC)** | nuits 22:00–06:00 et **tout** le week-end — énergie moins chère | — |
| **Dépassement** | kWh consommés, sur une heure, au-delà de la puissance souscrite | kWh |
| **Pénalité de dépassement** | montant facturé sur les kWh de dépassement | € |
| **Abonnement** | part fixe mensuelle, proportionnelle à la puissance souscrite | € |
| **Accise** | taxe sur l'électricité, par kWh consommé | € |
| **Énergie manager** | l'utilisateur du portail : pilote la consommation des sites du client | rôle |

Deux erreurs de vocabulaire fréquentes : dire « kW » pour une énergie (c'est kWh), et
confondre « seuil d'alerte » (kWh mensuels, par site) et « puissance souscrite » (kVA).

## Grille tarifaire du contrat Valmont Industries (`VLM-2026-0142`)

| Poste | Valeur |
|---|---|
| Énergie HP | 0,1842 €/kWh |
| Énergie HC | 0,1231 €/kWh |
| Abonnement | 2,85 €/kVA/mois |
| Pénalité de dépassement | 0,95 €/kWh excédentaire |
| Accise | 0,0205 €/kWh |
| TVA | 20 % |

## Facture mensuelle d'un site

```
abonnement  = puissanceSouscriteKva × 2,85
energieHP   = Σ kWh(HP) × 0,1842
energieHC   = Σ kWh(HC) × 0,1231
depassement = Σ_h max(0, kWh_h − puissanceSouscriteKva)
penalite    = depassement × 0,95
accise      = Σ kWh × 0,0205
totalHt     = abonnement + energieHP + energieHC + penalite + accise
totalTtc    = totalHt × 1,20
```

Lignes, dans l'ordre : `ABONNEMENT`, `ENERGIE_HP`, `ENERGIE_HC`, `PENALITE_DEPASSEMENT`
(présente même à 0 €), `ACCISE`. Arrondi au centime **à la sortie** seulement.

**L'arbitrage économique au cœur du métier** : 1 kVA de puissance souscrite en moins
économise 2,85 €/mois d'abonnement, mais coûte 0,95 € par heure où la consommation dépasse
la nouvelle puissance d'1 kW. Un site **surdimensionné** paie un abonnement inutile ; un site
**sous-dimensionné** paie des pénalités. C'est ce que vise l'optimisation de la puissance
souscrite (US-006).

## Alertes (dérivées, une par type, par site et par mois)

| Type | Condition | Sévérité |
|---|---|---|
| Dépassement de puissance | un relevé horaire > puissance souscrite | Critique si > 110 %, sinon Avertissement |
| Seuil mensuel dépassé | Σ kWh du mois > seuil d'alerte du site | Avertissement |
| Anomalie nocturne | moyenne week-end 00:00–05:00 > 60 % de la moyenne HP | Info |

## Les 12 sites et les scénarios d'août 2026

| Site | Type | Scénario en `2026-08` |
|---|---|---|
| `LYO-01` Usine de Vénissieux | usine | dépassements répétés → alerte **Critique** ; sous-dimensionné |
| `LIL-02` Entrepôt de Lesquin | entrepôt | jamais au-dessus de 45 % → **surdimensionné**, forte économie possible |
| `NTE-03` Centre de données de Carquefou | data center | charge plate, **anomalie nocturne** |
| `MRS-01` Usine de Fos-sur-Mer | usine | rattrapage de production le week-end → seuil mensuel dépassé de peu |
| `TLS-01` Laboratoire de Labège | laboratoire | léger dépassement (~104 %) → Avertissement |
| les 7 autres | divers | nominal |

Mois disponibles : `2026-03` à `2026-08` ; défaut `2026-08`.

Source de vérité : `docs/SPEC-TECHNIQUE.md` §4 et `backend/src/domain/`. En cas de
divergence entre cet aide-mémoire et le code, c'est le code qui a raison et cet aide-mémoire
qu'il faut corriger.
