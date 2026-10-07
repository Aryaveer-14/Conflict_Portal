/**
 * routes/agent.js
 * ---------------
 * POST /agent/          — Query the GCIP Intelligence Agent (Gemini-powered)
 * GET  /agent/history   — Retrieve chat history for a conversation (new MongoDB feature)
 *
 * Mirrors app/routers/agent.py with added chat persistence via MongoDB.
 */

import express from 'express';
import { body, validationResult } from 'express-validator';
import { askGemini } from '../services/geminiService.js';
import { getFallback } from '../services/fallbackService.js';
import ChatHistory from '../models/ChatHistory.js';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

const router = express.Router();

// Same system prompt as Python version
const SYSTEM_PROMPT = `You are GCIP Intelligence Agent, an expert geopolitical analyst.

IMPORTANT: Answer the user's specific question DIRECTLY. Tailor your response perfectly to what the user wants to know.
Do not force a full report structure (like executive summaries or forecasts) unless explicitly requested.
Keep your tone analytical, neutral, and evidence-based.

If appropriate, use geopolitical context, impact assessments (like commodities), and data-driven insights to address what the user asked.

At the end of the response include a confidence level (HIGH, MEDIUM, or LOW) based on data certainty.
Format it exactly as: CONFIDENCE: HIGH (or MEDIUM or LOW)`;

const SOURCES = ['conflict_events', 'commodity_prices', 'news_narratives'];

/**
 * Extract confidence from Gemini response text.
 * @param {string} text
 * @returns {{ cleanedText: string, confidence: string }}
 */
function extractConfidence(text) {
  const match = text.match(/CONFIDENCE:\s*(HIGH|MEDIUM|LOW)/i);
  if (match) {
    const confidence = match[1].toUpperCase();
    const cleanedText = text.slice(0, match.index).trimEnd();
    return { cleanedText, confidence };
  }
  return { cleanedText: text, confidence: 'MEDIUM' };
}

const isDBConnected = () => mongoose.connection.readyState === 1;

// ── POST /agent/ ──────────────────────────────────────────────────────────────
router.post(
  '/',
  [
    body('query').notEmpty().withMessage('query is required'),
    body('context').optional().isObject(),
    body('conversation_id').optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { query: userQuery, context = {}, conversation_id } = req.body;
    const convId = conversation_id || uuidv4();
    const prompt = `${SYSTEM_PROMPT}\n\nUser question: ${userQuery}`;

    let aiResponse;
    let confidence;

    try {
      const rawResponse = await askGemini(prompt);
      const extracted = extractConfidence(rawResponse);
      aiResponse = extracted.cleanedText;
      confidence = extracted.confidence;
    } catch (err) {
      console.error('[agent] Gemini error:', err.message);
      const fallback = getFallback(userQuery);
      aiResponse = fallback.response;
      confidence = fallback.confidence;
    }

    // Persist chat message to MongoDB if connected
    if (isDBConnected()) {
      try {
        await ChatHistory.findOneAndUpdate(
          { conversation_id: convId },
          {
            $push: {
              messages: [
                { role: 'user', content: userQuery, timestamp: new Date() },
                { role: 'assistant', content: aiResponse, confidence, timestamp: new Date() },
              ],
            },
            $inc: { query_count: 1 },
          },
          { upsert: true, new: true }
        );
      } catch (dbErr) {
        console.error('[agent] Failed to save chat history:', dbErr.message);
      }
    }

    res.json({
      success: true,
      data: {
        response: aiResponse,
        confidence,
        sources: SOURCES,
      },
      conversation_id: convId,
      timestamp: new Date().toISOString(),
      source: 'GCIP-Agent',
    });
  }
);

// ── GET /agent/history — NEW: Retrieve conversation history ───────────────────
router.get('/history/:conversation_id', async (req, res) => {
  if (!isDBConnected()) {
    return res.status(503).json({ error: 'Chat history requires MongoDB connection' });
  }

  const history = await ChatHistory.findOne({
    conversation_id: req.params.conversation_id,
  }).lean();

  if (!history) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  res.json(history);
});

export default router;
