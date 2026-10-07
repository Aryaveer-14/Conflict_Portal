/**
 * routes/simulate.js
 * ------------------
 * POST /simulate/   — Run scenario simulation
 *
 * Mirrors app/routers/simulate.py
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { runSimulation } from '../services/simulationService.js';

const router = express.Router();

router.post(
  '/',
  [
    body('event_id').optional().isString(),
    body('scenario_description').optional().isString(),
    body('variables').optional().isObject(),
    body('time_horizon_days').optional().isInt({ min: 1, max: 365 }).toInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const {
      event_id,
      scenario_description = '',
      variables = {},
      time_horizon_days = 30,
    } = req.body;

    const result = await runSimulation({ event_id, scenario_description, variables, time_horizon_days });
    res.json(result);
  }
);

export default router;
