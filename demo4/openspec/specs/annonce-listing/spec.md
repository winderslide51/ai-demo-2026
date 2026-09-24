# annonce-listing Specification

## Purpose

Lecture de la liste des annonces : contrat de l'API `GET /api/annonces` et comportement de la
page d'accueil (tri antéchronologique, états de chargement, d'erreur et de liste vide).

## Requirements

### Requirement: Lister les annonces via l'API
Le système SHALL exposer `GET /api/annonces` retournant toutes les annonces existantes,
triées de la plus récente à la plus ancienne selon leur date de création.

#### Scenario: Des annonces existent
- **WHEN** un client appelle `GET /api/annonces` alors que des annonces ont été créées
- **THEN** le système répond `200 OK` avec un tableau JSON dont chaque élément a la même
  représentation que celle renvoyée par la création (`id`, `title`, `category`, `description`,
  `price`, `city`, `postalCode`, `createdAt`), la plus récemment créée en premier

#### Scenario: Aucune annonce
- **WHEN** un client appelle `GET /api/annonces` alors qu'aucune annonce n'existe
- **THEN** le système répond `200 OK` avec un tableau vide `[]`, et jamais `404 Not Found`

### Requirement: Page d'accueil listant les annonces
Le frontend SHALL afficher sur la route `/` les annonces existantes sous forme de grille de
vignettes, chargées depuis `GET /api/annonces` à l'ouverture de la page.

#### Scenario: Annonces disponibles
- **WHEN** l'API renvoie au moins une annonce
- **THEN** la page affiche une vignette par annonce, dans l'ordre renvoyé par l'API,
  chacune montrant le titre, le prix formaté (`1 250 €`), le libellé français de la catégorie,
  la ville suivie du code postal, et la date de publication

#### Scenario: Chargement en cours
- **WHEN** l'appel à l'API n'a pas encore abouti
- **THEN** la page affiche un indicateur de chargement et aucun message d'erreur

#### Scenario: Aucune annonce
- **WHEN** l'API renvoie un tableau vide
- **THEN** la page affiche « Aucune annonce pour le moment. » et un lien invitant à déposer une annonce

#### Scenario: Erreur de chargement
- **WHEN** l'appel à l'API échoue (réseau ou `5xx`)
- **THEN** la page affiche un message d'erreur en français et un bouton « Réessayer »
  qui relance le chargement

#### Scenario: Vignette non cliquable
- **WHEN** l'utilisateur clique sur une vignette
- **THEN** aucune navigation n'a lieu : la vignette ne contient ni lien ni bouton
  (la page de détail fera l'objet d'un changement ultérieur)
