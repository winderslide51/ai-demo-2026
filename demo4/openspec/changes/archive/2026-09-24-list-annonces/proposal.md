## Why

Les annonces peuvent être créées, mais elles restent invisibles : la page d'accueil affiche
un simple placeholder et rien, dans l'application, ne permet de voir ce qui a été déposé.
Le produit n'a donc pas de boucle : on dépose sans jamais rien consulter. Afficher les annonces
existantes est la suite immédiate de `create-annonce` et la base de toutes les features de
consultation (détail, recherche, filtres) qui viendront ensuite.

## What Changes

- Nouvel endpoint REST `GET /api/annonces` renvoyant toutes les annonces, triées de la plus
  récente à la plus ancienne, sous forme de tableau JSON (même représentation qu'à la création).
- La page d'accueil `/` n'est plus un placeholder : elle affiche les annonces sous forme de
  grille de vignettes (titre, prix formaté, catégorie, ville et code postal, date de publication).
- Quatre états d'écran explicites : chargement, erreur avec bouton « Réessayer », aucune annonce,
  et liste peuplée.
- Ajout au design system d'une vignette d'annonce et d'une grille responsive
  (plusieurs colonnes à partir de 768px, une seule colonne en dessous).
- Nouvel utilitaire d'affichage des dates en français relatif (« il y a 2 jours »), sans dépendance.

## Capabilities

### New Capabilities
- `annonce-listing` : lecture de la liste des annonces — contrat de l'API `GET /api/annonces`
  et comportement de la page d'accueil (tri, états de chargement, d'erreur et liste vide).

### Modified Capabilities
- `leboncoin-design-system` : ajout de la vignette d'annonce et de la grille responsive.

## Impact

- **Backend** : `AnnonceRepository` (requête triée), `AnnonceService` (`findAll`),
  `AnnonceController` (`GET` collection). Aucun changement de schéma, aucune migration.
- **Frontend** : `src/pages/HomePage.tsx`, `src/api/annonces.ts` et nouveaux modules dans
  `src/features/annonces/` (hook de chargement, vignette, grille, date relative).
- **Aucune dépendance ajoutée** ; le contrat existant `POST /api/annonces` et
  `GET /api/annonces/{id}` est inchangé (pas de rupture).

## Non-objectifs

- Page de détail d'une annonce et vignettes cliquables (changement suivant).
- Pagination, défilement infini ou limite de résultats.
- Recherche, filtres par catégorie ou par ville : le champ de recherche de l'en-tête reste décoratif.
- Photos et miniatures : la vignette n'a pas d'emplacement image dans cette version.
- Tri choisi par l'utilisateur, édition et suppression d'une annonce.
