## Context

`create-annonce` (archivée) a posé le domaine, le contrat d'erreur `ProblemDetail`, le client API
et le design system. Ce changement n'ajoute qu'une lecture : une collection côté backend et une
page côté frontend. Les fondations sont réutilisées telles quelles ; la seule nouveauté
structurelle est le chargement de données dans une page (jusqu'ici, seul le formulaire appelait l'API).

## Goals / Non-Goals

**Goals:**
- Fermer la boucle produit : déposer une annonce puis la voir apparaître en tête de l'accueil.
- Un endpoint de collection simple et un ordre d'affichage garanti par le backend.
- Quatre états d'écran explicites et testés (chargement, erreur, vide, peuplé).

**Non-Goals:**
- Pagination, recherche, filtres, page de détail, photos (cf. « Non-objectifs » de la proposal).
- Mise en cache côté client ou rafraîchissement automatique.

## Decisions

1. **`GET /api/annonces` renvoie un tableau JSON nu**, pas une enveloppe `{content, page, …}`.
   La pagination est hors périmètre ; une enveloppe serait un contrat mort à maintenir et à tester.
   Si la pagination arrive, elle fera l'objet d'un changement explicite du contrat.

2. **Le tri vit dans le repository** : `findAllByOrderByCreatedAtDesc()`. L'ordre antéchronologique
   est une règle métier (spec), pas un paramètre client ; le figer dans la requête dérivée évite de
   passer un `Sort` depuis le service et rend l'ordre testable en `@DataJpaTest`.
   Alternative écartée : `Sort` construit dans le service — déplace une règle métier dans la couche appelante.

3. **Réutilisation de `AnnonceResponse`** plutôt qu'un `AnnonceSummaryResponse` allégé.
   Un seul contrat pour `POST`, `GET /{id}` et `GET`, donc un seul type `Annonce` côté TypeScript et
   un seul mapping. Dette assumée : la liste transporte `description` (jusqu'à 4000 caractères) par
   annonce, sans intérêt pour la vignette. À revisiter avec la pagination.

4. **Chargement dans un hook `useAnnonces`**, pas dans un `loader` react-router. Le tableau `routes`
   est partagé avec les tests (`src/test/renderWithRouter.tsx`) : un `loader` imposerait à chaque test
   rendant `/` de gérer `HydrateFallback` et `errorElement`, alors que le hook se teste exactement
   comme le formulaire (stub de `fetch`, `findBy*`). Le hook expose `state` (`loading` | `error` | `ready`)
   et `reload()` pour le bouton « Réessayer », et capture toute erreur — un échec réseau remonte en
   `TypeError`, pas en `ApiError`.

5. **Vignette autonome, pas le composant `Card`** : `Card` rend une `<section>` avec `--space-6` de
   padding, trop généreux pour une vignette. `AnnonceTile` reprend les mêmes tokens de surface avec
   `--space-4`. La grille est une `<ul>` de `<li>` (liste sémantique) en
   `grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))`.

6. **Date relative en français** via `Intl.RelativeTimeFormat('fr-FR', { numeric: 'auto' })` jusqu'à
   7 jours (« à l'instant », « hier », « il y a 2 jours »), puis date absolue
   (« 15 septembre 2026 ») — « il y a 143 jours » n'est pas un repère utile. Helper pur
   `formatRelativeDate(iso, now = new Date())` dans son propre module : testable de façon déterministe
   et conforme à la règle oxlint `only-export-components`. Aucune dépendance ajoutée.

## Risks / Trade-offs

- [Tous les tests rendant `/` déclenchent désormais un `fetch`] → `App.test.tsx` et `Header.test.tsx`
  doivent stubber `fetch`. On ne met pas de stub global dans `src/test/setup.ts` : il masquerait les
  appels involontaires des futurs tests.
- [État partagé entre les tests `@SpringBootTest`] → le contexte Spring, donc la base H2 mémoire, est
  réutilisé entre classes ; `AnnonceListIT` asserte sur les titres qu'il a lui-même créés, jamais sur
  une liste vide ni sur une taille absolue.
- [Ordre instable si deux annonces partagent le même `createdAt`] → les tests fixent des dates
  distinctes. Pas de tri secondaire par `id` : un UUID aléatoire n'apporte aucune sémantique.
- [Liste non bornée] → acceptable au volume d'une démo ; la pagination est le remède prévu.

## Open Questions

- Faut-il rafraîchir l'accueil après un dépôt (redirection vers `/` plutôt qu'écran de confirmation) ?
  Reporté : dépend de la page de détail, qui arrive au changement suivant.
