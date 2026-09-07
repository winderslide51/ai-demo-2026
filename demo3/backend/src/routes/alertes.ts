import { Router } from 'express';
import { acquitter, listerAlertes } from '../services/alertes.service.js';
import { lireBooleen, lireMois } from './mois.js';

export const alertesRouter = Router();

alertesRouter.get('/', (req, res) => {
  const siteId = typeof req.query.siteId === 'string' ? req.query.siteId : undefined;
  res.json(
    listerAlertes({
      mois: lireMois(req.query.mois),
      siteId,
      acquittee: lireBooleen(req.query.acquittee),
    }),
  );
});

alertesRouter.post('/:id/acquitter', (req, res) => {
  res.json(acquitter(req.params.id));
});
