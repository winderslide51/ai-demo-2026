---
name: ui-verification
description: Vérifier l'application EnerFlex dans un vrai Chrome via le serveur MCP Chrome DevTools — l'écran se rend, l'interaction fonctionne, la console est propre, les appels /api réussissent, rien ne déborde sur mobile. Complète Vitest, qui reste l'outil des tests de composants.
---

# Vérification dans le navigateur

Vitest teste les composants dans jsdom. Ce skill vérifie **l'application qui tourne** dans
un vrai Chrome : le proxy Vite, les vrais payloads, le CSS, les polices, la console. Un
Vitest vert ne dit rien d'un proxy cassé ou d'un graphique vide.

## Prérequis

```bash
npm run dev      # API sur :3001, UI sur :5173 (proxy /api)
```

Toujours piloter `http://localhost:5173`, jamais `:3001` — tester le chemin du proxy fait
partie du test.

## Boucle

1. `navigate_page` vers l'écran (`/sites/LIL-02?mois=2026-08`).
2. `take_snapshot` — l'arbre d'accessibilité. **Le lire avant d'agir** : il donne le `uid`
   de chaque élément et montre ce que l'utilisateur perçoit. Ne jamais cliquer à l'aveugle.
3. Agir : `click`, `fill`, `hover`.
4. `wait_for` sur le texte qui prouve le résultat, pas un délai fixe.
5. `list_console_messages` — toute erreur ou avertissement est un constat, même si l'écran
   a l'air correct.
6. `list_network_requests` — chaque appel `/api/...` en 2xx, ou un 4xx voulu dont le
   message français est affiché.
7. `take_screenshot` pour le rapport ou quand quelque chose cloche.

## À vérifier sur chaque écran

- Les trois états existent vraiment : forcer l'erreur en arrêtant l'API ou avec un
  `?mois=2020-01` (400 attendu, message affiché).
- Libellés en français ; pas de valeur brute (`DEPASSEMENT_PUISSANCE`), pas de date ISO.
- Chiffres formatés fr-FR (espace de milliers, virgule décimale, « € », « kWh », « kVA »).
- Les graphiques ont des données (pas un cadre vide) ; la ligne de puissance souscrite est visible.
- Clavier : Tab atteint chaque contrôle, Entrée active, focus visible.
- `resize_page` à 375 px : rien ne déborde horizontalement, la navigation reste accessible.
- Le message d'erreur affiché est celui du backend, pas une phrase générique.

## Rapporter un constat

```
Écran : détail du site LIL-02 (US-006)
Action : chargement de /sites/LIL-02?mois=2026-08
Attendu : bloc « Optimisation de la puissance souscrite » avec économie > 0
Observé : bloc absent, GET /api/sites/LIL-02/optimisation → 404
Preuve : requête réseau ci-dessus, capture jointe
```

## Garde-fous

- Ne jamais corriger depuis ce skill : rapporter à `react-dev` ou `node-dev`.
- Un écran propre avec des erreurs console est un échec.
- Une capture n'est pas une preuve de comportement : le snapshot et le journal réseau le sont.
- Ne pas remplacer un test de composant par le navigateur : ce qui se teste en Vitest s'y teste.

## Checklist

- [ ] Deux serveurs lancés ; piloté via `localhost:5173`.
- [ ] Snapshot lu avant chaque interaction.
- [ ] Console propre ; appels `/api` en 2xx ou 4xx voulu et affiché.
- [ ] Trois états observés ; formats fr-FR ; graphiques non vides.
- [ ] Clavier et 375 px vérifiés.
- [ ] Captures jointes pour les étapes qui comptent.
