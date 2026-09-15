## 1. Backend — modèle et persistance

- [ ] 1.1 Créer `Category` (enum, 9 valeurs) et l'entité JPA `Annonce` (`id` UUID généré, `title`,
      `category`, `description` `@Lob`/`length=4000`, `price` int, `city`, `postalCode`, `createdAt` Instant)
      dans `com.demo.annonces.annonce`
- [ ] 1.2 Créer `AnnonceRepository extends JpaRepository<Annonce, UUID>`
- [ ] 1.3 Test `@DataJpaTest` : sauvegarde puis relecture d'une annonce (`./mvnw test -Dtest=AnnonceRepositoryTest`)

## 2. Backend — service et API

- [ ] 2.1 Créer les records `CreateAnnonceRequest` (contraintes Jakarta + messages FR) et `AnnonceResponse`
- [ ] 2.2 Créer `AnnonceService` (`create`, `findById`) avec `@Transactional`, `createdAt` fixé via `Clock` injecté,
      et `AnnonceNotFoundException`
- [ ] 2.3 Créer `AnnonceController` : `POST /api/annonces` → 201 + `Location`, `GET /api/annonces/{id}` → 200
- [ ] 2.4 Créer `common/GlobalExceptionHandler` (`@RestControllerAdvice`) : 400 `ProblemDetail` + `errors[]`
      pour validation et enum inconnu, 404 pour `AnnonceNotFoundException`
- [ ] 2.5 Tests `@WebMvcTest(AnnonceController)` : création 201, chaque règle de validation → 400 avec le bon `field`,
      catégorie inconnue → 400, `GET` 200 et 404 (`./mvnw test -Dtest=AnnonceControllerTest`)
- [ ] 2.6 Test `@SpringBootTest` bout en bout (`POST` puis `GET` sur H2 mémoire) ; `./mvnw test` vert

## 3. Frontend — socle et design system

- [ ] 3.1 Créer `src/styles/tokens.css` (palette, typo, radius, espacements) et `src/styles/global.css`
      (reset, fond `--color-bg`) ; importer dans `main.tsx` ; supprimer `App.css`/`index.css` Vite
- [ ] 3.2 Créer `src/shared/ui/` : `Button` (variantes `primary`/`secondary`, `disabled`), `TextField`,
      `TextArea`, `Select`, `Card` — CSS Modules, props `error` + `aria-*`
- [ ] 3.3 Tests Testing Library pour `Button` (disabled) et `TextField` (label lié, erreur affichée)
- [ ] 3.4 Créer `src/shared/layout/Header` (logo « leboncoin », recherche placeholder, bouton pill vers `/deposer`,
      masquage recherche < 768px) + test de navigation
- [ ] 3.5 Mettre en place `react-router` (`createBrowserRouter`) avec layout `Header` + `<Outlet/>`,
      routes `/` (placeholder) et `/deposer` ; adapter `App.test.tsx`

## 4. Frontend — dépôt d'annonce

- [ ] 4.1 Créer `src/api/http.ts` (`ApiError` portant le `ProblemDetail` parsé) et
      `src/api/annonces.ts` (`createAnnonce`, `getAnnonce`, types `Annonce`, `CreateAnnonceInput`, `Category`)
- [ ] 4.2 Créer `src/features/annonces/validation.ts` (`validateAnnonce()` pure, mêmes bornes que le backend)
      + tests unitaires par règle
- [ ] 4.3 Créer `src/features/annonces/AnnonceForm.tsx` : 6 champs, validation client, focus premier champ en erreur,
      bouton désactivé pendant l'envoi, mapping des `errors[]` API sur les champs, bandeau d'erreur réseau
- [ ] 4.4 Créer `src/features/annonces/DeposerPage.tsx` : titre « Déposer une annonce », carte formulaire,
      état confirmation « Votre annonce est en ligne » avec résumé (prix formaté `fr-FR`)
- [ ] 4.5 Tests `AnnonceForm` (fetch mocké) : soumission valide → confirmation ; champ invalide → pas d'appel API,
      message + focus ; 400 API → message sous le champ ; 500 → bandeau
- [ ] 4.6 `npm run typecheck && npm run lint && npm test` verts

## 5. Vérification bout en bout

- [ ] 5.1 Lancer `./mvnw spring-boot:run` et `npm run dev`, déposer une annonce depuis le navigateur,
      vérifier `GET /api/annonces/{id}` et la persistance après redémarrage du backend
- [ ] 5.2 Vérifier le rendu à 375px et 1440px (en-tête, formulaire, confirmation) vs leboncoin.fr
