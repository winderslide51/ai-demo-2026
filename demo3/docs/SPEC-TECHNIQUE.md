# EnerFlex — Spécification technique

*Version 1.0 — état de l'application telle que construite. Ce document est mis à jour par
l'agent `tech-writer` à la fin de chaque user story livrée. Il décrit ce qui existe, jamais
ce qui est prévu.*

## 1. Le produit en une page

EnerFlex est un portail de suivi de consommation électrique **multi-sites** pour un client
industriel B2B d'un fournisseur d'énergie. Le client de démonstration, **Valmont
Industries**, exploite 12 sites en France (usines, entrepôts, siège, centre de données…).

Le portail permet à l'**énergie manager** du client de :

1. voir la consommation de chaque site et du parc (kWh, heures pleines / heures creuses) ;
2. lire la **facture mensuelle** de chaque site, calculée depuis la grille tarifaire du
   contrat ;
3. suivre les **alertes** (dépassement de puissance, seuil mensuel, anomalie de nuit) et
   les acquitter.

Un seul rôle utilisateur : l'énergie manager. Pas d'authentification (démo).

## 2. Stack et structure

| Côté | Technologie |
|---|---|
| Frontend | React 19, TypeScript strict, Vite 7, React Router 7, Recharts 2 |
| Backend | Node.js ≥ 22, Express 5, TypeScript strict, `tsx` (dev), `tsc` (build) |
| Données | En mémoire, générées de façon **déterministe** au démarrage (aucune base) |
| Tests | Vitest ; supertest côté API ; Testing Library côté UI ; seuil de couverture 70 % |
| Qualité | ESLint (typescript-eslint), Prettier |

```
backend/
  src/
    domain/          # règles métier PURES : tarification.ts, plages.ts, alertes.ts
    data/            # sites.ts (les 12 sites), grille.ts, generateur.ts (relevés horaires déterministes)
    services/        # orchestration : sites.service.ts, factures.service.ts, alertes.service.ts, synthese.service.ts
    routes/          # Express : parse la requête, appelle le service, répond
    app.ts           # createApp() — l'app Express sans écoute réseau (testable)
    server.ts        # écoute sur PORT (3001)
  tests/             # *.test.ts — domain (unitaires) et routes (supertest)
frontend/
  src/
    types/           # DTO miroir des réponses de l'API
    api/             # client.ts (fetch + erreurs) + un module par ressource
    hooks/           # un hook par ressource : data / status / error / reload
    components/ui/   # design system : Button, Card, KpiTile, Badge, DataTable, Sparkline, EmptyState, ErrorBanner, Spinner, Toast
    components/      # composants métier de présentation (sans fetch)
    pages/           # DashboardPage, SitesPage, SiteDetailPage, AlertesPage, ContratPage
    styles/          # tokens.css, global.css
    labels.ts        # tous les libellés français, en un seul endroit
```

## 3. Modèle de domaine

### Entités

| Entité | Champs | Notes |
|---|---|---|
| `Client` | `id`, `nom`, `contrat: Contrat` | un seul client dans la démo |
| `Contrat` | `reference`, `dateDebut`, `dateFin`, `grille: GrilleTarifaire` | |
| `GrilleTarifaire` | `hpPrixKwh`, `hcPrixKwh`, `abonnementKvaMois`, `penaliteKwhDepassement`, `acciseKwh`, `tvaTaux`, `heuresPleines: { debut, fin }`, `joursHeuresCreuses: string[]` | voir valeurs §4 |
| `Site` | `id`, `nom`, `ville`, `region`, `type`, `adresse`, `responsable`, `puissanceSouscriteKva`, `seuilAlerteKwh` | `type ∈ USINE, ENTREPOT, SIEGE, LOGISTIQUE, DATACENTER, LABORATOIRE` |
| `Releve` | `horodatage` (ISO, heure locale Europe/Paris), `kwh`, `plage: 'HP' \| 'HC'` | un relevé par heure ; `kwh` sur une heure = puissance moyenne en kW |
| `Facture` | `siteId`, `mois`, `lignes[]`, `totalHt`, `tva`, `totalTtc`, `depassement` | calculée à la lecture, jamais stockée |
| `Alerte` | `id`, `siteId`, `mois`, `type`, `severite`, `message`, `detecteeLe`, `acquittee` | dérivée des données ; seul `acquittee` est un état |

### Invariants

- Un relevé horaire est soit `HP` soit `HC`, jamais les deux — décidé par `domain/plages.ts`.
- La facture est **dérivée** des relevés et de la grille ; aucun montant n'est persisté.
- `acquittee` est le seul état mutable de l'application (en mémoire, perdu au redémarrage).
- Tout montant est arrondi à 2 décimales à la sortie (`arrondir2`), jamais en cours de calcul.

## 4. Règles métier (source de vérité : `backend/src/domain/`)

### 4.1 Plages horaires (`plages.ts`)

- **Heures pleines (HP)** : du lundi au vendredi, de 06:00 inclus à 22:00 exclu.
- **Heures creuses (HC)** : toutes les autres heures — nuits de 22:00 à 06:00 et **la
  totalité** des samedis et dimanches. (Simplification assumée : pas de jours fériés.)

### 4.2 Grille tarifaire du contrat (valeurs de la démo)

| Code | Libellé | Valeur |
|---|---|---|
| `hpPrixKwh` | Énergie heures pleines | 0,1842 €/kWh |
| `hcPrixKwh` | Énergie heures creuses | 0,1231 €/kWh |
| `abonnementKvaMois` | Abonnement (puissance souscrite) | 2,85 €/kVA/mois |
| `penaliteKwhDepassement` | Pénalité de dépassement | 0,95 €/kWh au-delà de la puissance souscrite |
| `acciseKwh` | Accise sur l'électricité | 0,0205 €/kWh |
| `tvaTaux` | TVA | 20 % |

### 4.3 Calcul de la facture mensuelle (`tarification.ts`)

Pour un site, un mois, ses relevés horaires et la grille :

```
abonnement   = puissanceSouscriteKva × abonnementKvaMois
energieHP    = Σ kwh(relevés HP) × hpPrixKwh
energieHC    = Σ kwh(relevés HC) × hcPrixKwh
depassement  = Σ_h max(0, kwh_h − puissanceSouscriteKva)   (kWh excédentaires ; 1 kVA ≈ 1 kW, simplification assumée)
penalite     = depassement × penaliteKwhDepassement
accise       = Σ kwh × acciseKwh
totalHt      = abonnement + energieHP + energieHC + penalite + accise
tva          = totalHt × tvaTaux
totalTtc     = totalHt + tva
```

Lignes de facture, dans cet ordre et avec ces codes : `ABONNEMENT`, `ENERGIE_HP`,
`ENERGIE_HC`, `PENALITE_DEPASSEMENT` (présente même à 0 €), `ACCISE`. Chaque ligne porte
`quantite`, `unite` (`kVA` ou `kWh`), `prixUnitaire`, `montant`.

`depassement` dans la facture expose aussi : `heures` (nombre d'heures en dépassement),
`kwh` (total excédentaire) et `puissanceMaxKw` (relevé horaire maximal du mois).

### 4.4 Alertes (`alertes.ts`)

Dérivées à la lecture pour un site et un mois. Identifiant stable :
`${siteId}-${mois}-${type}` (une alerte d'un type par site et par mois).

| Type | Condition | Sévérité | Message (FR) |
|---|---|---|---|
| `DEPASSEMENT_PUISSANCE` | au moins un relevé horaire > `puissanceSouscriteKva` | `CRITIQUE` si max > 110 % de la puissance souscrite, sinon `AVERTISSEMENT` | « Puissance souscrite dépassée : {max} kW pour {souscrite} kVA ({heures} h de dépassement). » |
| `SEUIL_CONSOMMATION` | Σ kwh du mois > `seuilAlerteKwh` | `AVERTISSEMENT` | « Consommation mensuelle de {kwh} kWh au-dessus du seuil de {seuil} kWh. » |
| `ANOMALIE_NUIT` | moyenne des relevés week-end de 00:00 à 05:00 inclus (6 relevés par nuit) > 60 % de la moyenne des relevés HP du mois | `INFO` | « Consommation nocturne de week-end anormalement élevée ({moyenne} kW en moyenne). » |

`detecteeLe` = horodatage du premier relevé qui déclenche la condition (ou du dernier jour
du mois pour `SEUIL_CONSOMMATION` et `ANOMALIE_NUIT`). L'acquittement est conservé en
mémoire dans un `Set<string>` d'identifiants d'alertes.

### 4.5 Données de démo (`data/`)

- **12 sites** de Valmont Industries (voir `data/sites.ts`) ; puissances souscrites entre
  160 et 1 600 kVA ; seuils d'alerte mensuels propres à chaque site.
- **Mois disponibles** : de `2026-03` à `2026-08` inclus. Mois par défaut de l'API : **`2026-08`**
  (dernier mois clos).
- Générateur déterministe (PRNG à graine = `hash(siteId + mois)`) : profil de charge selon le
  type de site, creux de nuit et de week-end, saisonnalité légère, et des **scénarios
  volontaires** en `2026-08` pour que la démo ait quelque chose à montrer :
  - `LYO-01` (usine) : dépassements répétés → alerte `CRITIQUE` ;
  - `LIL-02` (entrepôt) : puissance très surdimensionnée (jamais au-dessus de 45 %) ;
  - `NTE-03` (data center) : anomalie de nuit ;
  - `MRS-01` (usine) : rattrapage de production le week-end → seuil mensuel dépassé de peu ;
  - `TLS-01` (usine) : léger dépassement (~104 %) → alerte `AVERTISSEMENT`.

## 5. Contrat d'API

Base : `http://localhost:3001/api` — le frontend passe par le proxy Vite `/api`.
Paramètre `mois` : `YYYY-MM`, optionnel, défaut `2026-08`. Un mois hors plage → `400`.
Site inconnu → `404` « Site inconnu : XXX-99. ». Corps d'erreur : `{ "message": "<phrase en français>" }`.

| Verbe | Route | Réponse | Erreurs |
|---|---|---|---|
| GET | `/api/health` | `{ status: 'ok' }` | |
| GET | `/api/client` | `Client` (avec `contrat.grille`) | |
| GET | `/api/mois` | `{ mois: string[], moisParDefaut: string }` | |
| GET | `/api/synthese?mois=` | `Synthese` | 400 |
| GET | `/api/sites?mois=` | `SiteResume[]` (12, triés par `nom`) | 400 |
| GET | `/api/sites/:id?mois=` | `SiteDetail` | 400, 404 |
| GET | `/api/sites/:id/consommation?mois=` | `{ siteId, mois, releves: Releve[] }` | 400, 404 |
| GET | `/api/sites/:id/facture?mois=` | `Facture` | 400, 404 |
| GET | `/api/alertes?mois=&siteId=&acquittee=` | `Alerte[]` triées par sévérité puis site ; `acquittee` ∈ `true`/`false` | 400 (mois ou `acquittee` invalide), 404 (siteId inconnu) |
| POST | `/api/alertes/:id/acquitter` | `Alerte` (acquittee = true) | 404 « Alerte introuvable. » ; **409** « Cette alerte est déjà acquittée. » |

### Formes de réponse

```ts
type Synthese = {
  mois: string; nbSites: number;
  consommationKwh: number; consommationHpKwh: number; consommationHcKwh: number;
  montantHt: number; montantTtc: number; penalitesHt: number;
  nbAlertesActives: number; nbSitesEnDepassement: number;
  evolutionPct: number | null;                     // vs mois précédent, null si indisponible
  historique: { mois: string; consommationKwh: number; montantHt: number }[];  // mois disponibles jusqu'au mois demandé (6 au plus), croissant
  topSites: { siteId: string; nom: string; consommationKwh: number; montantHt: number }[]; // 5, décroissant
}

type SiteResume = {
  id: string; nom: string; ville: string; region: string; type: SiteType;
  puissanceSouscriteKva: number; seuilAlerteKwh: number;
  consommationKwh: number; consommationHpKwh: number; consommationHcKwh: number;
  puissanceMaxKw: number; depassementKwh: number; heuresDepassement: number;
  montantHt: number; nbAlertesActives: number;
  evolutionPct: number | null;
  tendance: number[];                              // consommation des mois disponibles jusqu'au mois demandé, 6 au plus
}

type SiteDetail = SiteResume & {
  adresse: string; responsable: string;
  facture: Facture;
  journalier: { date: string; hpKwh: number; hcKwh: number; puissanceMaxKw: number; depassementKwh: number }[];
  profilHoraire: { heure: number; moyenneKw: number }[];   // 24 entrées
  alertes: Alerte[];
}

type Releve = { horodatage: string; kwh: number; plage: 'HP' | 'HC' }

type LigneFacture = { code: string; libelle: string; quantite: number; unite: 'kVA' | 'kWh'; prixUnitaire: number; montant: number }
type Facture = {
  siteId: string; mois: string; lignes: LigneFacture[];
  totalHt: number; tva: number; totalTtc: number;
  depassement: { heures: number; kwh: number; puissanceMaxKw: number };
}

type Alerte = {
  id: string; siteId: string; siteNom: string; mois: string;
  type: 'DEPASSEMENT_PUISSANCE' | 'SEUIL_CONSOMMATION' | 'ANOMALIE_NUIT';
  severite: 'CRITIQUE' | 'AVERTISSEMENT' | 'INFO';
  message: string; detecteeLe: string; acquittee: boolean;
}
```

## 6. Frontend

| Route | Page | Contenu |
|---|---|---|
| `/` | Tableau de bord | KPIs du parc (kWh, € HT, pénalités, alertes), courbe 6 mois, top 5 sites, alertes critiques |
| `/sites` | Sites | tableau des 12 sites : conso, HP/HC, puissance max vs souscrite, dépassement, € HT, sparkline |
| `/sites/:id` | Détail d'un site | fiche, KPIs, profil journalier (HP/HC empilés), profil horaire moyen, **facture détaillée**, alertes du site |
| `/alertes` | Alertes | liste filtrable (sévérité, site, acquittées), action « Acquitter » |
| `/contrat` | Contrat | client, référence, grille tarifaire, définition des plages |

Un sélecteur de **mois** global (barre supérieure) pilote toutes les pages (`?mois=` dans l'URL).
Chaque appel distant gère ses trois états : chargement, erreur (message du backend), vide.

## 7. Décisions (ADR)

| ADR | Titre | Statut |
|---|---|---|
| [0001](adr/0001-regles-metier-pures-dans-domain.md) | Règles métier en fonctions pures dans `backend/src/domain/` | Acceptée |
| [0002](adr/0002-donnees-en-memoire-deterministes.md) | Données en mémoire, générées de façon déterministe | Acceptée |
| [0003](adr/0003-facture-et-alertes-derivees.md) | Facture et alertes dérivées à la lecture, jamais stockées | Acceptée |

## 8. Qualité

- `npm test` à la racine lance les deux suites avec le seuil de couverture à 70 %.
- Tests unitaires du domaine (`tarification`, `plages`, `alertes`) : un test par règle du §4.
- Tests d'API (supertest) : un test par ligne du contrat du §5, y compris les erreurs.
- Tests UI (Testing Library) : rendu, état vide, état d'erreur, interaction principale par page.

## 9. Historique des livraisons

| Date | Story | Résumé |
|---|---|---|
| 2026-09-07 | Socle | Application initiale : 12 sites, facture HP/HC + pénalités, alertes, 5 écrans |
