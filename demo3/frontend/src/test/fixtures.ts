import type { Alerte, Client, Facture, MoisDisponibles, SiteDetail, SiteResume, Synthese } from '../types/dto'

export const moisFixture: MoisDisponibles = {
  mois: ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'],
  moisParDefaut: '2026-08',
}

export const clientFixture: Client = {
  id: 'valmont',
  nom: 'Valmont Industries',
  contrat: {
    reference: 'CTR-2025-04871',
    dateDebut: '2025-01-01',
    dateFin: '2027-12-31',
    grille: {
      hpPrixKwh: 0.1842,
      hcPrixKwh: 0.1231,
      abonnementKvaMois: 2.85,
      penaliteKwhDepassement: 0.95,
      acciseKwh: 0.0205,
      tvaTaux: 0.2,
      heuresPleines: { debut: 6, fin: 22 },
      joursHeuresCreuses: ['samedi', 'dimanche'],
    },
  },
}

export const syntheseFixture: Synthese = {
  mois: '2026-08',
  nbSites: 12,
  consommationKwh: 2_412_380,
  consommationHpKwh: 1_520_000,
  consommationHcKwh: 892_380,
  montantHt: 398_120.5,
  montantTtc: 477_744.6,
  penalitesHt: 4_312.25,
  nbAlertesActives: 4,
  nbSitesEnDepassement: 2,
  evolutionPct: 3.2,
  historique: [
    { mois: '2026-03', consommationKwh: 2_300_000, montantHt: 380_000 },
    { mois: '2026-04', consommationKwh: 2_250_000, montantHt: 372_000 },
    { mois: '2026-05', consommationKwh: 2_310_000, montantHt: 381_000 },
    { mois: '2026-06', consommationKwh: 2_380_000, montantHt: 392_000 },
    { mois: '2026-07', consommationKwh: 2_337_000, montantHt: 386_000 },
    { mois: '2026-08', consommationKwh: 2_412_380, montantHt: 398_120.5 },
  ],
  topSites: [
    { siteId: 'LYO-01', nom: 'Usine de Vénissieux', consommationKwh: 612_000, montantHt: 101_000 },
    { siteId: 'NTE-03', nom: 'Centre de données de Nantes', consommationKwh: 540_000, montantHt: 88_000 },
    { siteId: 'MRS-01', nom: 'Usine de Marseille', consommationKwh: 410_000, montantHt: 67_000 },
    { siteId: 'LIL-02', nom: 'Entrepôt de Lille', consommationKwh: 120_000, montantHt: 21_000 },
    { siteId: 'PAR-00', nom: 'Siège de Paris', consommationKwh: 98_000, montantHt: 17_000 },
  ],
}

export const siteLyon: SiteResume = {
  id: 'LYO-01',
  nom: 'Usine de Vénissieux',
  ville: 'Vénissieux',
  region: 'Auvergne-Rhône-Alpes',
  type: 'USINE',
  puissanceSouscriteKva: 1000,
  seuilAlerteKwh: 650_000,
  consommationKwh: 612_000,
  consommationHpKwh: 420_000,
  consommationHcKwh: 192_000,
  puissanceMaxKw: 1_180,
  depassementKwh: 3_240,
  heuresDepassement: 27,
  montantHt: 101_000,
  nbAlertesActives: 2,
  evolutionPct: 5.4,
  tendance: [560_000, 570_000, 580_000, 600_000, 590_000, 612_000],
}

export const siteLille: SiteResume = {
  id: 'LIL-02',
  nom: 'Entrepôt de Lille',
  ville: 'Lille',
  region: 'Hauts-de-France',
  type: 'ENTREPOT',
  puissanceSouscriteKva: 400,
  seuilAlerteKwh: 200_000,
  consommationKwh: 120_000,
  consommationHpKwh: 70_000,
  consommationHcKwh: 50_000,
  puissanceMaxKw: 170,
  depassementKwh: 0,
  heuresDepassement: 0,
  montantHt: 21_000,
  nbAlertesActives: 0,
  evolutionPct: -1.8,
  tendance: [125_000, 122_000, 121_000, 119_000, 122_000, 120_000],
}

export const alerteCritique: Alerte = {
  id: 'LYO-01-2026-08-DEPASSEMENT_PUISSANCE',
  siteId: 'LYO-01',
  siteNom: 'Usine de Vénissieux',
  mois: '2026-08',
  type: 'DEPASSEMENT_PUISSANCE',
  severite: 'CRITIQUE',
  message: 'Puissance souscrite dépassée : 1 180 kW pour 1 000 kVA (27 h de dépassement).',
  detecteeLe: '2026-08-03T14:00:00+02:00',
  acquittee: false,
}

export const alerteInfo: Alerte = {
  id: 'NTE-03-2026-08-ANOMALIE_NUIT',
  siteId: 'NTE-03',
  siteNom: 'Centre de données de Nantes',
  mois: '2026-08',
  type: 'ANOMALIE_NUIT',
  severite: 'INFO',
  message: 'Consommation nocturne de week-end anormalement élevée (610 kW en moyenne).',
  detecteeLe: '2026-08-31T23:00:00+02:00',
  acquittee: false,
}

export const factureLyon: Facture = {
  siteId: 'LYO-01',
  mois: '2026-08',
  lignes: [
    { code: 'ABONNEMENT', libelle: 'Abonnement (puissance souscrite)', quantite: 1000, unite: 'kVA', prixUnitaire: 2.85, montant: 2_850 },
    { code: 'ENERGIE_HP', libelle: 'Énergie heures pleines', quantite: 420_000, unite: 'kWh', prixUnitaire: 0.1842, montant: 77_364 },
    { code: 'ENERGIE_HC', libelle: 'Énergie heures creuses', quantite: 192_000, unite: 'kWh', prixUnitaire: 0.1231, montant: 23_635.2 },
    { code: 'PENALITE_DEPASSEMENT', libelle: 'Pénalité de dépassement', quantite: 3_240, unite: 'kWh', prixUnitaire: 0.95, montant: 3_078 },
    { code: 'ACCISE', libelle: "Accise sur l'électricité", quantite: 612_000, unite: 'kWh', prixUnitaire: 0.0205, montant: 12_546 },
  ],
  totalHt: 119_473.2,
  tva: 23_894.64,
  totalTtc: 143_367.84,
  depassement: { heures: 27, kwh: 3_240, puissanceMaxKw: 1_180 },
}

const jours = Array.from({ length: 31 }, (_, i) => {
  const day = String(i + 1).padStart(2, '0')
  const weekend = [1, 2, 8, 9, 15, 16, 22, 23, 29, 30].includes(i + 1)
  return {
    date: `2026-08-${day}`,
    hpKwh: weekend ? 0 : 14_000 + (i % 5) * 300,
    hcKwh: weekend ? 9_000 : 6_000 + (i % 3) * 200,
    puissanceMaxKw: weekend ? 520 : i === 2 ? 1_180 : 940 + (i % 7) * 10,
    depassementKwh: i === 2 ? 3_240 : 0,
  }
})

export const siteDetailLyon: SiteDetail = {
  ...siteLyon,
  adresse: '14 rue des Forges',
  responsable: 'Camille Roux',
  facture: factureLyon,
  journalier: jours,
  profilHoraire: Array.from({ length: 24 }, (_, heure) => ({ heure, moyenneKw: heure >= 6 && heure < 22 ? 800 + heure * 5 : 380 })),
  alertes: [alerteCritique],
}
