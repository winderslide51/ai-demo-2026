// Shared types of the EnerFlex API — mirrored by frontend/src/types/.
// Field names are French on purpose: they are the API contract (docs/SPEC-TECHNIQUE.md §5).

export type SiteType = 'USINE' | 'ENTREPOT' | 'SIEGE' | 'LOGISTIQUE' | 'DATACENTER' | 'LABORATOIRE';

export type Plage = 'HP' | 'HC';

export type GrilleTarifaire = {
  hpPrixKwh: number;
  hcPrixKwh: number;
  abonnementKvaMois: number;
  penaliteKwhDepassement: number;
  acciseKwh: number;
  tvaTaux: number;
  heuresPleines: { debut: number; fin: number };
  joursHeuresCreuses: string[];
};

export type Contrat = {
  reference: string;
  dateDebut: string;
  dateFin: string;
  grille: GrilleTarifaire;
};

export type Client = {
  id: string;
  nom: string;
  contrat: Contrat;
};

export type Site = {
  id: string;
  nom: string;
  ville: string;
  region: string;
  type: SiteType;
  adresse: string;
  responsable: string;
  puissanceSouscriteKva: number;
  seuilAlerteKwh: number;
};

export type Releve = {
  horodatage: string;
  kwh: number;
  plage: Plage;
};

export type LigneFacture = {
  code: string;
  libelle: string;
  quantite: number;
  unite: 'kVA' | 'kWh';
  prixUnitaire: number;
  montant: number;
};

export type Depassement = {
  heures: number;
  kwh: number;
  puissanceMaxKw: number;
};

export type Facture = {
  siteId: string;
  mois: string;
  lignes: LigneFacture[];
  totalHt: number;
  tva: number;
  totalTtc: number;
  depassement: Depassement;
};

export type AlerteType = 'DEPASSEMENT_PUISSANCE' | 'SEUIL_CONSOMMATION' | 'ANOMALIE_NUIT';

export type Severite = 'CRITIQUE' | 'AVERTISSEMENT' | 'INFO';

export type Alerte = {
  id: string;
  siteId: string;
  siteNom: string;
  mois: string;
  type: AlerteType;
  severite: Severite;
  message: string;
  detecteeLe: string;
  acquittee: boolean;
};

export type SiteResume = {
  id: string;
  nom: string;
  ville: string;
  region: string;
  type: SiteType;
  puissanceSouscriteKva: number;
  seuilAlerteKwh: number;
  consommationKwh: number;
  consommationHpKwh: number;
  consommationHcKwh: number;
  puissanceMaxKw: number;
  depassementKwh: number;
  heuresDepassement: number;
  montantHt: number;
  nbAlertesActives: number;
  evolutionPct: number | null;
  tendance: number[];
};

export type Journalier = {
  date: string;
  hpKwh: number;
  hcKwh: number;
  puissanceMaxKw: number;
  depassementKwh: number;
};

export type ProfilHoraire = {
  heure: number;
  moyenneKw: number;
};

export type SiteDetail = SiteResume & {
  adresse: string;
  responsable: string;
  facture: Facture;
  journalier: Journalier[];
  profilHoraire: ProfilHoraire[];
  alertes: Alerte[];
};

export type Synthese = {
  mois: string;
  nbSites: number;
  consommationKwh: number;
  consommationHpKwh: number;
  consommationHcKwh: number;
  montantHt: number;
  montantTtc: number;
  penalitesHt: number;
  nbAlertesActives: number;
  nbSitesEnDepassement: number;
  evolutionPct: number | null;
  historique: { mois: string; consommationKwh: number; montantHt: number }[];
  topSites: { siteId: string; nom: string; consommationKwh: number; montantHt: number }[];
};
