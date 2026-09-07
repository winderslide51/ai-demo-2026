# TypeScript — Do / Don't (backend et frontend)

## Do

- `strict: true` partout ; typer les entrées et sorties publiques explicitement.
- Modéliser les ensembles fermés par des unions littérales : `type Plage = 'HP' | 'HC'`.
- Préférer `unknown` + narrowing à un cast quand la forme d'une valeur est incertaine.
- Nommer les fonctions par leur effet métier, en anglais : `calculerFacture` est toléré
  côté domaine parce que le vocabulaire métier est français (voir AGENTS.md), mais les
  variables, helpers techniques et fichiers restent en anglais.
- Une fonction du domaine est **pure** : mêmes entrées → même sortie, pas d'horloge, pas
  d'I/O, pas de `Math.random` (le générateur de données utilise une graine explicite).
- Arrondir les montants **à la sortie** avec `arrondir2`, jamais entre deux étapes.
- Formatter les nombres et dates pour l'utilisateur avec `Intl` en `fr-FR`.

## Don't

- Pas de `any`, pas de `as any`, pas de `@ts-ignore`, pas de `!` pour faire taire le compilateur.
- Pas de `enum` TypeScript : union de littéraux.
- Pas de valeur brute d'énumération (`DEPASSEMENT_PUISSANCE`) ni de date ISO visible par
  l'utilisateur : passer par `labels.ts` et `format.ts`.
- Pas de `console.log` dans le code livré (un seul log au démarrage du serveur).
- Pas de logique métier dupliquée entre backend et frontend : le frontend affiche, il ne calcule pas.
- Pas de dépendance ajoutée sans la nommer dans le rapport de l'agent.
