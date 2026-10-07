/**
 * routes/news.js
 * --------------
 * GET /news/    — Search news articles (?q=query&limit=20)
 *
 * Mirrors app/routers/news.py
 */

import express from 'express';
import { query, validationResult } from 'express-validator';
import { fetchNews } from '../services/newsService.js';

const router = express.Router();

router.get(
  '/',
  [
    query('q').notEmpty().withMessage('Search query (q) is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { q, limit = 20 } = req.query;
    const articles = await fetchNews(q, limit);

    res.json({
      query: q,
      total_results: articles.length,
      articles,
    });
  }
);

export default router;
