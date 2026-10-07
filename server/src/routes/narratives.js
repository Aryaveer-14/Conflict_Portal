/**
 * routes/narratives.js
 * --------------------
 * GET /narratives/   — Extracted narratives (?event_id=&q=)
 *
 * Mirrors app/routers/narratives.py
 */

import express from 'express';
import { extractNarratives } from '../services/narrativeService.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { event_id, q } = req.query;
  const narratives = await extractNarratives({ event_id, query: q });
  res.json({ count: narratives.length, narratives });
});

export default router;
