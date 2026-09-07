import { Router } from 'express';
import { factureParId } from '../services/factures.service.js';
import { detaillerSite, listerSites, relevesDuSite } from '../services/sites.service.js';
import { lireMois } from './mois.js';

export const sitesRouter = Router();

sitesRouter.get('/', (req, res) => {
  res.json(listerSites(lireMois(req.query.mois)));
});

sitesRouter.get('/:id', (req, res) => {
  res.json(detaillerSite(req.params.id, lireMois(req.query.mois)));
});

sitesRouter.get('/:id/consommation', (req, res) => {
  res.json(relevesDuSite(req.params.id, lireMois(req.query.mois)));
});

sitesRouter.get('/:id/facture', (req, res) => {
  res.json(factureParId(req.params.id, lireMois(req.query.mois)));
});
