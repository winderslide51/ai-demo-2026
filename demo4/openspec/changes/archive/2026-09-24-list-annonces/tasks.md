## 1. Backend — endpoint de liste

- [x] 1.1 Ajouter `List<Annonce> findAllByOrderByCreatedAtDesc()` à `AnnonceRepository` et un test
      `@DataJpaTest` (3 annonces aux `createdAt` distincts, insérées dans le désordre → ordre
      antéchronologique) : `./mvnw test -Dtest=AnnonceRepositoryTest`
- [x] 1.2 Ajouter `AnnonceService.findAll()` (`@Transactional(readOnly = true)`, mapping via
      `AnnonceResponse::from`) : couvert par 1.3
- [x] 1.3 Ajouter `GET /api/annonces` à `AnnonceController` (tableau JSON nu) et les tests
      `@WebMvcTest` : 200 + tableau de 2 avec tous les champs et l'ordre du service préservé,
      200 + tableau vide quand le service ne renvoie rien (jamais 404) :
      `./mvnw test -Dtest=AnnonceControllerTest`
- [x] 1.4 Ajouter `AnnonceListIT` (`@SpringBootTest`) : deux `POST` puis `GET`, les deux annonces
      présentes et la plus récente en premier : `./mvnw test`

## 2. Frontend — socle de chargement

- [x] 2.1 Ajouter `listAnnonces()` à `src/api/annonces.ts` : `npm run typecheck`
- [x] 2.2 Créer `src/features/annonces/relativeDate.ts` (`formatRelativeDate(iso, now)`) et ses tests
      (un cas par seuil, `now` explicite) : `npx vitest run src/features/annonces/relativeDate.test.ts`
- [x] 2.3 Créer `src/features/annonces/useAnnonces.ts` (états `loading` / `error` / `ready`, `reload()`,
      annulation au démontage, capture de toute erreur) : couvert par 2.6

## 3. Frontend — vignettes et page d'accueil

- [x] 3.1 Créer `AnnonceTile.tsx` + `AnnonceTile.module.css` (titre en `h3`, prix via `formatPrice`,
      libellé de catégorie, ville et code postal, `<time dateTime>`, aucun lien ni bouton) et son test :
      `npx vitest run src/features/annonces/AnnonceTile.test.tsx`
- [x] 3.2 Créer `AnnonceList.tsx` + `AnnonceList.module.css` (grille `<ul>`/`<li>`, plusieurs colonnes
      ≥ 768px, une colonne en dessous) et son test :
      `npx vitest run src/features/annonces/AnnonceList.test.tsx`
- [x] 3.3 Réécrire `src/pages/HomePage.tsx` avec les quatre états (chargement, erreur + « Réessayer »,
      vide + lien vers `/deposer`, liste) et `HomePage.module.css` ; tests via `renderApp('/')` :
      `npx vitest run src/pages/HomePage.test.tsx`
- [x] 3.4 Mettre à jour `App.test.tsx` (nouveau titre) et `Header.test.tsx` (stub de `fetch`) :
      `npm test`
- [x] 3.5 `npm run typecheck && npm run lint && npm test && npm run build`

## 4. Vérification bout en bout

- [x] 4.1 Lancer `./mvnw spring-boot:run` et `npm run dev`, déposer une annonce et vérifier qu'elle
      apparaît en tête de l'accueil, puis recharger la page
- [x] 4.2 Vérifier le rendu à 375px (une colonne) et 1440px (plusieurs colonnes), ainsi que les états
      vide et erreur (backend arrêté)
