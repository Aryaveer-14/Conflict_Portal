/**
 * routes/forecast.js
 * ------------------
 * GET /forecast/   — 30-day conflict predictions
 *
 * Mirrors app/routers/forecast.py
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { generateForecast } from '../services/forecastService.js';

const router = express.Router();

router.get(
  '/',
  [
    query('event_id').optional().isString(),
    query('region').optional().isString(),
    query('severity').optional().isFloat({ min: 0, max: 10 }).toFloat(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { event_id, region, severity } = req.query;
    const result = await generateForecast({ event_id, region, severity });
    res.json(result);
  }
);

export default router;
