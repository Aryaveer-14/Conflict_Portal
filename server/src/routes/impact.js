/**
 * routes/impact.js
 * ----------------
 * POST /impact/   — Compute cascade impact scores for an event
 *
 * Mirrors app/routers/impact.py
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { computeImpact } from '../services/impactService.js';

const router = express.Router();

router.post(
  '/',
  [
    body('event_id').notEmpty().withMessage('event_id is required'),
    body('region').optional().isString(),
    body('include_economic').optional().isBoolean().toBoolean(),
    body('include_humanitarian').optional().isBoolean().toBoolean(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { event_id, region, include_economic = true, include_humanitarian = true } = req.body;
    const result = await computeImpact({ event_id, region, include_economic, include_humanitarian });
    res.json(result);
  }
);

export default router;
