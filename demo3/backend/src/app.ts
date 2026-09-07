// The Express application, without network listening — tests mount it with supertest.

import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errors.js';
import { alertesRouter } from './routes/alertes.js';
import { diversRouter } from './routes/divers.js';
import { sitesRouter } from './routes/sites.js';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.use('/api', diversRouter);
  app.use('/api/sites', sitesRouter);
  app.use('/api/alertes', alertesRouter);

  app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'Ressource introuvable.' });
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ message: err.message });
      return;
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur interne du serveur.' });
  });

  return app;
}
