## ADDED Requirements

### Requirement: Vignette d'annonce et grille
Le frontend SHALL fournir une vignette d'annonce et une grille responsive, stylées uniquement
avec les tokens de `src/styles/tokens.css`.

#### Scenario: Apparence de la vignette
- **WHEN** une vignette d'annonce est rendue
- **THEN** elle est posée sur une surface blanche (`--color-surface`) avec `--radius-md` et
  `--shadow-sm`, le prix en évidence, les métadonnées (catégorie, localisation, date) en
  `--color-text-muted`, et aucun emplacement pour une photo

#### Scenario: Grille responsive
- **WHEN** la fenêtre fait au moins 768px
- **THEN** les vignettes se répartissent sur plusieurs colonnes de largeur égale,
  espacées de `--space-4`

#### Scenario: Grille sur mobile
- **WHEN** la fenêtre fait moins de 768px
- **THEN** les vignettes s'empilent sur une seule colonne
