/**
 * routes/commodities.js
 * ---------------------
 * GET /commodities/   — Brent oil + natural gas prices
 *
 * Mirrors app/routers/commodities.py
 */

import express from 'express';
import { fetchCommodityPrices } from '../services/commodityService.js';

const router = express.Router();

router.get('/', async (_req, res) => {
  const data = await fetchCommodityPrices();
  res.json(data);
});

export default router;
