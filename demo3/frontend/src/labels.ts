import type { AlerteType, Plage, Severite, SiteType } from './types/dto'

export const siteTypeLabels: Record<SiteType, string> = {
  USINE: 'Usine',
  ENTREPOT: 'Entrepôt',
  SIEGE: 'Siège',
  LOGISTIQUE: 'Plateforme logistique',
  DATACENTER: 'Centre de données',
  LABORATOIRE: 'Laboratoire',
}

export const alerteTypeLabels: Record<AlerteType, string> = {
  DEPASSEMENT_PUISSANCE: 'Dépassement de puissance',
  SEUIL_CONSOMMATION: 'Seuil mensuel dépassé',
  ANOMALIE_NUIT: 'Anomalie nocturne',
}

export const severiteLabels: Record<Severite, string> = {
  CRITIQUE: 'Critique',
  AVERTISSEMENT: 'Avertissement',
  INFO: 'Info',
}

export const plageLabels: Record<Plage, string> = {
  HP: 'Heures pleines',
  HC: 'Heures creuses',
}

export const labels = {
  appName: 'EnerFlex',
  appTagline: 'Suivi de consommation multi-sites',

  // navigation & pages
  navTableauDeBord: 'Tableau de bord',
  navSites: 'Sites',
  navAlertes: 'Alertes',
  navContrat: 'Contrat',
  pageTableauDeBord: 'Tableau de bord',
  pageSites: 'Sites',
  pageAlertes: 'Alertes',
  pageContrat: 'Contrat',
  pageSite: 'Détail du site',
  pageIntrouvable: 'Page introuvable',
  retourAccueil: "Retour à l'accueil",

  // top bar
  mois: 'Mois',
  alertesActives: 'alertes actives',
  alerteActive: 'alerte active',

  // remote states
  chargement: 'Chargement…',
  erreurGenerique: 'Une erreur est survenue.',
  erreurReseau: 'Impossible de joindre le serveur.',
  reessayer: 'Réessayer',

  // dashboard
  kpiConsommation: 'Consommation du parc',
  kpiMontantHt: 'Montant HT',
  kpiPenalites: 'Pénalités de dépassement',
  kpiAlertes: 'Alertes actives',
  kpiSitesEnDepassement: 'sites en dépassement',
  historiqueTitre: 'Consommation sur 6 mois',
  historiqueSousTitre: 'Parc complet, en MWh',
  topSitesTitre: 'Top 5 sites',
  topSitesSousTitre: 'Par consommation du mois',
  alertesCritiquesTitre: 'Alertes critiques',
  alertesCritiquesSousTitre: 'À traiter en priorité',
  aucuneAlerteCritique: 'Aucune alerte critique ce mois-ci.',
  voirToutesLesAlertes: 'Voir toutes les alertes',
  vsMoisPrecedent: 'vs mois précédent',

  // sites
  colSite: 'Site',
  colType: 'Type',
  colConsommation: 'Consommation',
  colRepartition: 'HP / HC',
  colPuissance: 'Puissance max / souscrite',
  colDepassement: 'Dépassement',
  colMontantHt: 'Montant HT',
  colTendance: 'Tendance',
  colEvolution: 'Évolution',
  aucunSite: 'Aucun site pour ce mois.',
  ouvrirSite: 'Ouvrir la fiche du site',

  // site detail
  responsable: 'Responsable',
  adresse: 'Adresse',
  puissanceSouscrite: 'Puissance souscrite',
  puissanceMax: 'Puissance max relevée',
  seuilAlerte: "Seuil d'alerte mensuel",
  kpiConsommationSite: 'Consommation du mois',
  kpiDepassement: 'Dépassement',
  heuresDepassement: 'h en dépassement',
  journalierTitre: 'Consommation journalière',
  journalierSousTitre: 'Heures pleines et heures creuses, en kWh',
  puissanceTitre: 'Puissance maximale par jour',
  puissanceSousTitre: 'Comparée à la puissance souscrite',
  profilHoraireTitre: 'Profil horaire moyen',
  profilHoraireSousTitre: 'Puissance moyenne par heure, en kW',
  factureTitre: 'Facture du mois',
  factureSousTitre: 'Calculée depuis la grille tarifaire du contrat',
  colLibelle: 'Libellé',
  colQuantite: 'Quantité',
  colPrixUnitaire: 'Prix unitaire',
  colMontant: 'Montant',
  totalHt: 'Total HT',
  tva: 'TVA',
  totalTtc: 'Total TTC',
  alertesDuSite: 'Alertes du site',
  aucuneAlerteSite: 'Aucune alerte pour ce site ce mois-ci.',
  retourSites: 'Tous les sites',

  // alertes
  filtreSeverite: 'Sévérité',
  filtreSite: 'Site',
  filtreToutes: 'Toutes',
  filtreTousLesSites: 'Tous les sites',
  afficherAcquittees: 'Afficher les acquittées',
  acquitter: 'Acquitter',
  acquittee: 'Acquittée',
  alerteAcquittee: 'Alerte acquittée.',
  aucuneAlerte: 'Aucune alerte pour ce mois.',
  detecteeLe: 'Détectée le',
  fermer: 'Fermer',

  // contrat
  contratTitre: 'Contrat de fourniture',
  reference: 'Référence',
  periode: 'Période',
  grilleTitre: 'Grille tarifaire',
  grilleSousTitre: 'Prix hors taxes appliqués à chaque site',
  plagesTitre: 'Plages horaires',
  ligneHp: 'Énergie heures pleines',
  ligneHc: 'Énergie heures creuses',
  ligneAbonnement: 'Abonnement (puissance souscrite)',
  lignePenalite: 'Pénalité de dépassement',
  ligneAccise: "Accise sur l'électricité",
  ligneTva: 'TVA',
  definitionHp: (debut: number, fin: number) =>
    `Du lundi au vendredi, de ${debut} h à ${fin} h.`,
  definitionHc: 'Toutes les autres heures : nuits, ainsi que la totalité des week-ends.',
  parKwh: 'par kWh',
  parKvaMois: 'par kVA et par mois',
  parKwhDepassement: 'par kWh au-delà de la puissance souscrite',
  duAu: (debut: string, fin: string) => `Du ${debut} au ${fin}`,
} as const
