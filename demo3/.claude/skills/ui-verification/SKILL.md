---
name: ui-verification
description: Vérifier l'application EnerFlex dans un vrai Chrome via le plugin Claude in Chrome — l'écran se rend, l'interaction fonctionne, la console est propre, les appels /api réussissent, rien ne déborde sur mobile. Complète Vitest, qui reste l'outil des tests de composants.
---

# Vérification dans le navigateur

Vitest teste les composants dans jsdom. Ce skill vérifie **l'application qui tourne** dans
un vrai Chrome : le proxy Vite, les vrais payloads, le CSS, les polices, la console. Un
Vitest vert ne dit rien d'un proxy cassé ou d'un graphique vide.

Le navigateur est piloté par le plugin **Claude in Chrome** (outils
`mcp__claude-in-chrome__*`), pas par le serveur MCP Chrome DevTools.

## Prérequis

```bash
npm run dev      # API sur :3001, UI sur :5173 (proxy /api)
```

Toujours piloter `http://localhost:5173`, jamais `:3001` — tester le chemin du proxy fait
partie du test.

Si les outils sont différés, les charger **en un seul appel** :

```text
ToolSearch select:mcp__claude-in-chrome__tabs_context_mcp,mcp__claude-in-chrome__navigate,
mcp__claude-in-chrome__computer,mcp__claude-in-chrome__read_page,
mcp__claude-in-chrome__read_console_messages,mcp__claude-in-chrome__read_network_requests,
mcp__claude-in-chrome__resize_window,mcp__claude-in-chrome__find
```

## Boucle

1. `tabs_context_mcp { createIfEmpty: true }` — obligatoire en premier : il donne le `tabId`
   que tous les autres outils exigent. Ne jamais réutiliser un `tabId` d'une autre session.
2. `read_network_requests` **tout de suite**, avant la navigation : le journal réseau ne se
   remplit qu'à partir du premier appel de l'outil. Sauté, il renverra « No requests found ».
3. `navigate` vers l'écran (`localhost:5173/sites/LIL-02?mois=2026-08`).
4. `read_page { filter: "interactive" }` — l'arbre d'accessibilité. **Le lire avant d'agir** :
   il donne le `ref` de chaque élément et montre ce que l'utilisateur perçoit. Ne jamais
   cliquer à l'aveugle. `get_page_text` si c'est le texte, pas la structure, qui compte.
5. Agir : `computer { action: "left_click", ref }` (ou `hover`, `type`, `key`, `scroll`),
   `form_input` pour un champ ou un `select`.
6. `find` sur le texte qui prouve le résultat, plutôt qu'une attente fixe ; en dernier
   recours `computer { action: "wait", duration }`.
7. `read_console_messages { pattern: "..." }` — toujours avec un motif, sinon le bruit de
   Vite noie le reste. Toute erreur ou avertissement applicatif est un constat, même si
   l'écran a l'air correct.
8. `read_network_requests { urlPattern: "/api/" }` — chaque appel en 2xx, ou un 4xx voulu
   dont le message français est affiché.
9. `computer { action: "screenshot" }` pour le rapport ou quand quelque chose cloche
   (`save_to_disk: true` si la capture doit être jointe).
10. `tabs_close_mcp` sur l'onglet ouvert quand la vérification est finie.

## À vérifier sur chaque écran

- Les trois états existent vraiment : forcer l'erreur en arrêtant l'API ou avec un
  `?mois=2020-01` (400 attendu, message affiché).
- Libellés en français ; pas de valeur brute (`DEPASSEMENT_PUISSANCE`), pas de date ISO.
- Chiffres formatés fr-FR (espace de milliers, virgule décimale, « € », « kWh », « kVA »).
- Les graphiques ont des données (pas un cadre vide) ; la ligne de puissance souscrite est visible.
- Clavier : `computer { action: "key", text: "Tab" }` atteint chaque contrôle, Entrée active,
  focus visible.
- `resize_window` à 375 px de large : rien ne déborde horizontalement, la navigation reste
  accessible.
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
- Une capture n'est pas une preuve de comportement : `read_page` et le journal réseau le sont.
- Ne pas remplacer un test de composant par le navigateur : ce qui se teste en Vitest s'y teste.
- Ne pas déclencher d'`alert` / `confirm` : une boîte de dialogue bloque le plugin.
- Après deux ou trois échecs du même appel, s'arrêter et le dire — pas de boucle de retry.

## Checklist

- [ ] Deux serveurs lancés ; piloté via `localhost:5173`.
- [ ] `tabs_context_mcp` appelé, puis `read_network_requests` **avant** la navigation.
- [ ] `read_page` lu avant chaque interaction.
- [ ] Console propre ; appels `/api` en 2xx ou 4xx voulu et affiché.
- [ ] Trois états observés ; formats fr-FR ; graphiques non vides.
- [ ] Clavier et 375 px vérifiés.
- [ ] Captures jointes pour les étapes qui comptent ; onglet refermé.
