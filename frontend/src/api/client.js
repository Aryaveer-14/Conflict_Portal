/**
 * client.js
 * ---------
 * Single gateway for all GCIP frontend ↔ backend API communication.
 * Built on Axios with request/response interceptors, timeout config,
 * and scoped API modules for each backend domain.
 *
 * Usage:
 *   import { eventsAPI, agentAPI, narrativesAPI, commoditiesAPI, impactAPI } from "../api/client";
 *   eventsAPI.getAll();
 *   agentAPI.query("How does this conflict affect oil supply?");
 */

import axios from "axios";

// ══════════════════════════════════════════════════════════════════════════════
// Axios Instance
// ══════════════════════════════════════════════════════════════════════════════

/**
 * `api` — the configured Axios instance used by all API modules.
 * Base URL is read from the Vite environment variable VITE_API_BASE_URL,
 * falling back to localhost:8000 for local development.
 */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 30000, // 30 s — generous for AI inference round-trips
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ══════════════════════════════════════════════════════════════════════════════
// Request Interceptor — Logging
// ══════════════════════════════════════════════════════════════════════════════

api.interceptors.request.use(
  (config) => {
    // Log every outgoing request for easy debugging during development
    console.log(
      `[GCIP API] ➜ ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`
    );
    return config;
  },
  (error) => {
    console.error("[GCIP API] Request setup error:", error.message);
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// Response Interceptor — Error Normalisation
// ══════════════════════════════════════════════════════════════════════════════

api.interceptors.response.use(
  // Pass through successful responses unchanged
  (response) => response,

  // Normalise all error shapes into a single readable message
  (error) => {
    const status = error.response?.status;
    const serverDetail =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error;

    const message =
      serverDetail ||
      error.message ||
      "An unexpected error occurred. Please try again.";

    // Attach a normalised message so callers don't need to dig into Axios internals
    const normalisedError = new Error(message);
    normalisedError.status = status;
    normalisedError.original = error;

    console.error(`[GCIP API] ✖ ${status ?? "NETWORK"} — ${message}`);

    return Promise.reject(normalisedError);
  }
);

// ══════════════════════════════════════════════════════════════════════════════
// API Modules
// ══════════════════════════════════════════════════════════════════════════════

// ── Events ────────────────────────────────────────────────────────────────────

/**
 * eventsAPI
 * ---------
 * Conflict event data from the backend events service.
 */
export const eventsAPI = {
  /**
   * Fetch a list of conflict events.
   * @param {number} [limit=20] - Maximum number of events to return.
   * @returns {Promise<AxiosResponse>}
   */
  getAll: (limit = 20) =>
    api.get("/events/", { params: { limit } }),
};

// ── Narratives ────────────────────────────────────────────────────────────────

/**
 * narrativesAPI
 * -------------
 * AI-extracted conflict narratives tied to specific events.
 */
export const narrativesAPI = {
  /**
   * Fetch narratives for a given conflict event.
   * @param {string|number} eventId - ID of the conflict event.
   * @returns {Promise<AxiosResponse>}
   */
  getNarratives: (eventId) =>
    api.get("/narratives/", { params: { event_id: eventId } }),
};

// ── AI Agent ──────────────────────────────────────────────────────────────────

/**
 * agentAPI
 * --------
 * Gemini-powered conflict intelligence agent.
 */
export const agentAPI = {
  /**
   * Send a natural-language question to the AI agent.
   * @param {string} question        - The user's query about global conflicts.
   * @param {Object} [context={}]    - Optional structured context to pass alongside the query.
   * @returns {Promise<AxiosResponse<{ success: boolean, data: { response: string } }>>}
   *
   * @example
   * const res = await agentAPI.query("How does this conflict affect oil supply?");
   * console.log(res.data.data.response);
   */
  query: (question, context = {}) =>
    api.post("/agent/", { query: question, context }),
};

// ── Commodities ───────────────────────────────────────────────────────────────

/**
 * commoditiesAPI
 * --------------
 * Global commodity price and supply data affected by conflicts.
 */
export const commoditiesAPI = {
  /**
   * Fetch all available commodity records.
   * @returns {Promise<AxiosResponse>}
   */
  getAll: () => api.get("/commodities/"),
};

// ── Impact ────────────────────────────────────────────────────────────────────

/**
 * impactAPI
 * ---------
 * AI-generated socioeconomic impact analysis for conflict events.
 */
export const impactAPI = {
  /**
   * Request an impact analysis for a specific conflict event.
   * @param {string|number} eventId   - ID of the conflict event.
   * @param {Object}        eventData - Structured event data to analyse.
   * @returns {Promise<AxiosResponse>}
   *
   * @example
   * const res = await impactAPI.getImpact("evt_123", { country: "Sudan", casualties: 500 });
   */
  getImpact: (eventId, eventData) =>
    api.post("/impact/", { event_id: eventId, event_data: eventData }),
};


// ── News ───────────────────────────────────────────────────────────────────
/**
 * newsAPI
 * -------
 * Global conflict news intelligence.
 */
export const newsAPI = {
  /**
   * Search news articles by query.
   * @param {string} q       - The keyword query (e.g., 'conflict impact').
   * @param {number} limit   - Maximum results.
   * @param {Object} axiosConfig - Additional axios configuration.
   * @returns {Promise<AxiosResponse>}
   */
  search: (q = 'geopolitical conflict OR supply chain disruption', limit = 20, axiosConfig = {}) =>
    api.get('/news/', { params: { q, limit }, ...axiosConfig }),
};
