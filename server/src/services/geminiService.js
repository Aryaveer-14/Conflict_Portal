/**
 * services/geminiService.js
 * -------------------------
 * Core service for interacting with Google Gemini AI via the official JS SDK.
 * Mirrors gemini_service.py — same model chain, same fallback logic.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('⚠️  GEMINI_API_KEY not set — AI features will use fallback responses.');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Same model chain as the Python service
const MODEL_CHAIN = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

const GENERATION_CONFIG = {
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

/**
 * Send a prompt to Gemini and return the response text.
 * Tries multiple models and retries on rate limits.
 *
 * @param {string} prompt - The prompt to send.
 * @returns {Promise<string>} - The generated text.
 */
export async function askGemini(prompt) {
  if (!genAI) {
    throw new Error('Gemini API key not configured');
  }

  let lastError;

  for (const modelName of MODEL_CHAIN) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: GENERATION_CONFIG,
      });

      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (err) {
      lastError = err;
      const errStr = String(err.message || err);
      // On rate limit or quota error, try the next model
      if (errStr.includes('429') || errStr.toLowerCase().includes('quota')) {
        continue;
      }
      // Any other error — also try next model
      continue;
    }
  }

  throw new Error(`Gemini API error: ${lastError?.message || lastError}`);
}
