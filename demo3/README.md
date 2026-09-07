# EnerFlex — portail de suivi de consommation multi-sites

Mini-portail B2B pour un client industriel d'un fournisseur d'énergie : 12 sites, leur
consommation (heures pleines / heures creuses), leur facture mensuelle calculée depuis la
grille tarifaire du contrat (abonnement à la puissance souscrite, pénalités de dépassement)
et leurs alertes.

C'est un **projet de démonstration** : l'application est volontairement modeste pour que
l'attention aille aux **agents IA** qui la font évoluer. Le déroulé de la démo est dans
[`PLAN.MD`](PLAN.MD).

## Démarrer

```powershell
npm install
npm run dev        # API http://localhost:3001  ·  UI http://localhost:5173
npm test           # les deux suites, couverture ≥ 70 %
```

Node.js 22 ou plus. Aucune base de données : les données sont générées en mémoire, de façon
déterministe.

## Stack

React 19 + TypeScript + Vite + Recharts côté client ; Node.js + Express 5 + TypeScript côté
serveur ; Vitest des deux côtés (supertest, Testing Library).

## Se repérer

| Dossier | Contenu |
|---|---|
| `specs/` | les user stories, en français — l'artefact du client |
| `docs/SPEC-TECHNIQUE.md` | ce qui est construit : modèle, règles, contrat d'API, écrans, ADR |
| `docs/architecture/`, `docs/adr/` | plans par story et décisions |
| `docs/revues/`, `docs/rapports/` | revues du besoin et du code, rapports de livraison |
| `backend/src/domain/` | les règles métier, en fonctions pures |
| `frontend/src/components/ui/` | le design system (voir `docs/design/DESIGN.md`) |
| `.claude/agents/` | les sept agents : `business-analyst`, `architect`, `test-dev`, `node-dev`, `react-dev`, `reviewer`, `tech-writer` |
| `.claude/skills/` | les pratiques : `implement-us` (le workflow), `story-readiness`, `architecture-plan`, `tdd-tests`, `node-domain-rule`, `react-screen`, `react-testing`, `ui-verification`, `code-review`, `delivery-report`, `tech-spec-update`, `enerflex-domain` |
| `.claude/rules/` | les règles auto-chargées : workflow, TypeScript, backend, frontend |
| `AGENTS.md` | la mémoire du projet pour tout assistant |

## Livrer une story

```text
Utilise le skill implement-us sur US-006.
```

Le workflow enchaîne : revue du besoin → plan → **relecture humaine** → tests (rouges) →
**relecture humaine** → implémentation backend + frontend → revue de code → **relecture
humaine** → rapport de livraison + mise à jour de la spec technique.
