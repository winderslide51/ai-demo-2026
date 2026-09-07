# Frontend React — Do / Don't

## Do

- Couches : `types/` (DTO) → `api/` (une fonction par endpoint) → `hooks/` (data / status /
  error / reload) → `components/` (présentation pure) → `pages/` (composition + états).
- Gérer explicitement les **trois états** de chaque appel distant : chargement, erreur
  (message du backend affiché tel quel), vide (message français).
- Réutiliser le design system `components/ui/` et les tokens de `styles/tokens.css`.
- Tout libellé visible vient de `labels.ts` ; tout nombre ou date passe par `format.ts`.
- Un statut ou une sévérité s'affiche avec une couleur **et** un texte.
- Chaque élément interactif a un nom accessible et un état de focus visible ; un bouton
  d'action est désactivé pendant la requête.
- Tester à travers les yeux de l'utilisateur : `getByRole`, `getByLabelText`, `getByText` ;
  mocker le module `api/`, jamais `fetch`.
- Couvrir par écran : rendu avec données, état vide, état d'erreur, interaction principale.

## Don't

- Pas de `fetch` hors de `src/api/`.
- Pas de règle métier dans un composant (pas de calcul de facture, de pénalité, de seuil).
- Pas de couleur, taille ou espacement littéral hors de `tokens.css`.
- Pas de texte anglais, de valeur brute d'énumération ni de date ISO à l'écran.
- Pas de message d'erreur générique à la place de celui renvoyé par l'API.
- Pas de `data-testid` quand un rôle ou un libellé existe ; pas de `fireEvent`, `userEvent`.
- Pas de `waitFor` avec délai arbitraire : `findBy*`.
