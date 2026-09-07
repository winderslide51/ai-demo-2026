# EnerFlex — Direction design

*Référence pour toute personne (ou agent) qui touche à `frontend/`. Les tokens vivent dans
`frontend/src/styles/tokens.css` ; ce document explique le pourquoi.*

## Parti pris : « salle de contrôle éditoriale »

Un portail énergie B2B se lit comme un tableau de bord industriel : des chiffres d'abord,
denses, lisibles de loin, sur un fond calme. On évite le look « SaaS générique » (cartes
blanches flottantes, dégradés violets, Inter partout) et on assume :

- **Une barre latérale d'encre** (bleu nuit profond) avec un accent **lime électrique** pour
  l'élément actif — la seule touche vive de la navigation.
- **Un contenu sur papier chaud** (blanc cassé légèrement texturé d'une trame millimétrée
  très discrète) : les données se lisent comme sur un relevé imprimé.
- **Des chiffres en monospace, à chasse fixe**, gros et alignés — on compare des kWh et des
  euros, il faut que les colonnes s'alignent.
- **Deux couleurs métier omniprésentes** : ambre pour les heures pleines, sarcelle pour les
  heures creuses. Rouge signal réservé au dépassement. Jamais de couleur seule : toujours un
  libellé à côté.
- **Un seul moment d'animation** : la révélation en cascade de la page au chargement
  (`animation-delay` échelonné sur les tuiles). Pas de micro-animations partout.

## Typographie (Google Fonts, avec repli système)

| Rôle | Police | Repli |
|---|---|---|
| Titres, chiffres clés | `Bricolage Grotesque` 600/700 | `"Segoe UI"`, sans-serif |
| Texte | `IBM Plex Sans` 400/500/600 | system-ui, sans-serif |
| Chiffres tabulaires, codes | `IBM Plex Mono` 400/500 | `ui-monospace`, monospace |

Échelle : 12 / 13 / 14 / 16 / 20 / 28 / 40 px. Texte courant 14 px. Chiffre de KPI 40 px
en `Bricolage Grotesque`, `font-variant-numeric: tabular-nums`.

## Tokens

```css
:root {
  /* encre & papier */
  --ink-900: #0b1730;  --ink-800: #12213f;  --ink-700: #1c2f55;
  --paper: #f7f5f0;    --surface: #ffffff;  --surface-2: #f1eee7;
  --line: #e3dfd5;     --line-strong: #cfc9bb;
  --text: #16202f;     --text-muted: #5c6675;  --text-faint: #8a93a1;

  /* accent navigation */
  --lime: #c8f04d;     --lime-ink: #2b3a00;

  /* métier */
  --hp: #e8962e;       --hp-soft: #fbead3;       /* heures pleines : ambre */
  --hc: #178f83;       --hc-soft: #d5efeb;       /* heures creuses : sarcelle */
  --overage: #d4434b;  --overage-soft: #fadcdc;  /* dépassement : rouge signal */

  /* feedback */
  --success: #1e8a5a;  --warning: #b8720a;  --danger: #c23b3b;  --info: #2f5fb3;

  /* espacement (4 px) */
  --s-1: 4px; --s-2: 8px; --s-3: 12px; --s-4: 16px; --s-5: 20px; --s-6: 24px; --s-8: 32px; --s-10: 40px;

  --radius: 10px;  --radius-sm: 6px;
  --shadow: 0 1px 2px rgb(11 23 48 / 6%), 0 8px 24px -12px rgb(11 23 48 / 18%);
  --font-display: 'Bricolage Grotesque', 'Segoe UI', sans-serif;
  --font-body: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', ui-monospace, monospace;
}
```

Fond de page : `--paper` + trame millimétrée
`background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 32px 32px; opacity très faible via un pseudo-élément`.

## Composants du design system (`src/components/ui/`)

| Composant | Props | Notes |
|---|---|---|
| `Button` | `variant: 'primary' \| 'secondary' \| 'ghost' \| 'danger'`, `size`, `loading`, `disabled` | primaire = encre sur lime ; spinner + désactivé pendant `loading` |
| `KpiTile` | `label`, `value`, `unit`, `delta?`, `tone?` | chiffre 40 px display, unité en petit mono, delta avec flèche **et** signe |
| `Card` | `title?`, `subtitle?`, `actions?`, `children` | surface blanche, bord `--line`, ombre douce |
| `Badge` | `tone: 'hp' \| 'hc' \| 'overage' \| 'critique' \| 'avertissement' \| 'info' \| 'neutral' \| 'success'`, `children` | couleur + texte, jamais couleur seule |
| `DataTable` | `columns`, `rows`, `emptyMessage`, `rowKey`, `onRowClick?` | chiffres alignés à droite en mono ; jamais un corps vide sans message |
| `Sparkline` | `values: number[]`, `tone?` | SVG inline 96×28, sans axe |
| `PowerGauge` | `value`, `max`, `label` | barre horizontale : puissance max vs souscrite, rouge au-delà de 100 % |
| `Spinner` / `EmptyState` / `ErrorBanner` | `label` / `message` / `message` + `onRetry` | les trois états distants |
| `Toast` | `kind`, `message`, `onClose` | auto-fermeture 5 s |
| `MonthPicker` | `value`, `options`, `onChange` | dans la barre supérieure, pilote `?mois=` |

## Layout

- Barre latérale fixe 240 px (`--ink-900`) : logo « EnerFlex » (display, avec un éclair lime),
  navigation (Tableau de bord, Sites, Alertes, Contrat), en bas le nom du client et le contrat.
- Barre supérieure : titre de page + sélecteur de mois + pastille d'alertes actives.
- Contenu : `max-width: 1320px`, grille `gap: var(--s-4)`, une colonne sous 900 px ; la barre
  latérale devient une barre d'onglets en bas sous 900 px.

## Graphiques (Recharts)

- Aire empilée journalière HP (ambre) / HC (sarcelle) ; ligne pointillée rouge = puissance
  souscrite sur le graphe de puissance max.
- Pas de grille lourde : lignes horizontales `--line` seulement, axes en `--text-faint`,
  police mono 11 px. Infobulle sur fond encre, texte papier.
- Sparklines en SVG maison (pas Recharts) dans les tableaux.

## Accessibilité

- Contraste ≥ 4.5:1 sur le texte ; lime uniquement sur encre, jamais sur blanc.
- Focus visible : `outline: 2px solid var(--lime)` sur encre, `var(--info)` sur papier.
- Toute icône seule a un `aria-label` français ; tableaux avec `<th scope>`.
- Boutons d'action désactivés pendant la requête ; toasts annoncés via `role="status"`.
- Lisible à 1280 px et à 375 px.
