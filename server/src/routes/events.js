/**
 * routes/events.js
 * ----------------
 * GET /events/        — List conflict events (with filters)
 * GET /events/:id     — Single event by ID
 *
 * Mirrors app/routers/events.py
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { fetchEvents, fetchEventById } from '../services/gdeltService.js';

const router = express.Router();

// ── GET /events/ ──────────────────────────────────────────────────────────────
router.get(
  '/',
  [
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('offset').optional().isInt({ min: 0 }).toInt(),
    query('country').optional().isString(),
    query('region').optional().isString(),
    query('start_date').optional().isISO8601(),
    query('end_date').optional().isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { limit = 25, offset = 0, country, region, start_date, end_date } = req.query;

    const events = await fetchEvents({ limit, offset, country, region, start_date, end_date });
    res.json({ count: events.length, events });
  }
);

// ── GET /events/:id ───────────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  const event = await fetchEventById(req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

export default router;
