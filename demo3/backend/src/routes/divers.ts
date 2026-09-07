import { Router } from 'express';
import { CLIENT } from '../data/grille.js';
import { MOIS_DISPONIBLES, MOIS_PAR_DEFAUT } from '../data/mois.js';
import { calculerSynthese } from '../services/synthese.service.js';
import { lireMois } from './mois.js';

export const diversRouter = Router();

diversRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

diversRouter.get('/client', (_req, res) => {
  res.json(CLIENT);
});

diversRouter.get('/mois', (_req, res) => {
  res.json({ mois: [...MOIS_DISPONIBLES], moisParDefaut: MOIS_PAR_DEFAUT });
});

diversRouter.get('/synthese', (req, res) => {
  res.json(calculerSynthese(lireMois(req.query.mois)));
});
