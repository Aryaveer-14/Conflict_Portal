/**
 * useConflictData.js
 * ------------------
 * Central data-management hook for the GCIP dashboard.
 *
 * Responsibilities:
 *  - Fetch conflict events and commodity data from the backend
 *  - Keep loading + error state so components stay clean
 *  - Auto-refresh data every 5 minutes
 *  - Preserve previous data when a refresh fails (no flickering UI)
 *  - Expose `selectedEvent` + `setSelectedEvent` for drill-down views
 *
 * Usage:
 *   const { events, commodities, loading, errors, lastUpdated } = useConflictData();
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { eventsAPI, commoditiesAPI } from "../api/client";

// ── Constants ──────────────────────────────────────────────────────────────────
const AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const EVENTS_LIMIT = 25;

// ══════════════════════════════════════════════════════════════════════════════
// Hook
// ══════════════════════════════════════════════════════════════════════════════

/**
 * useConflictData
 *
 * @returns {{
 *   events:           Array,
 *   commodities:      Array,
 *   selectedEvent:    Object|null,
 *   setSelectedEvent: Function,
 *   loading:          { events: boolean, commodities: boolean },
 *   errors:           { events: string|null, commodities: string|null },
 *   lastUpdated:      Date|null,
 *   refresh:          Function,
 * }}
 */
const useConflictData = () => {
  // ── State ────────────────────────────────────────────────────────────────────

  /** Conflict event records returned from the backend */
  const [events, setEvents] = useState([]);

  /** Global commodity data (price, supply, etc.) */
  const [commodities, setCommodities] = useState([]);

  /** The event the user has drilled into (set by components) */
  const [selectedEvent, setSelectedEvent] = useState(null);

  /**
   * Granular loading flags so the UI can show skeleton states
   * per section rather than a single full-page spinner.
   */
  const [loading, setLoading] = useState({
    events: false,
    commodities: false,
  });

  /**
   * Granular error messages — null means no error for that section.
   * Previous data is kept so the UI doesn't go blank on a failed refresh.
   */
  const [errors, setErrors] = useState({
    events: null,
    commodities: null,
  });

  /** Timestamp of the last successful full refresh */
  const [lastUpdated, setLastUpdated] = useState(null);

  // Track mount status to prevent state updates after unmount
  const isMounted = useRef(true);

  // ── Fetch: Events ─────────────────────────────────────────────────────────

  /**
   * fetchEvents
   * Fetches the latest conflict events from the backend.
   * On failure, keeps the existing `events` state and records the error.
   */
  const fetchEvents = useCallback(async () => {
    if (!isMounted.current) return;

    // Signal loading for events section only
    setLoading((prev) => ({ ...prev, events: true }));
    setErrors((prev) => ({ ...prev, events: null }));

    try {
      const response = await eventsAPI.getAll(EVENTS_LIMIT);

      if (!isMounted.current) return;

      // Support both { events: [...] } and a plain array response shape
      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.events ?? data?.results ?? []);

      setEvents(list);
    } catch (err) {
      if (!isMounted.current) return;

      console.error("[useConflictData] Failed to fetch events:", err.message);

      // Record the error but DO NOT clear previous events — preserve last good data
      setErrors((prev) => ({
        ...prev,
        events: err.message || "Failed to load conflict events.",
      }));
    } finally {
      if (isMounted.current) {
        setLoading((prev) => ({ ...prev, events: false }));
      }
    }
  }, []);

  // ── Fetch: Commodities ────────────────────────────────────────────────────

  /**
   * fetchCommodities
   * Fetches global commodity records from the backend.
   * On failure, keeps existing `commodities` state and records the error.
   */
  const fetchCommodities = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading((prev) => ({ ...prev, commodities: true }));
    setErrors((prev) => ({ ...prev, commodities: null }));

    try {
      const response = await commoditiesAPI.getAll();

      if (!isMounted.current) return;

      const data = response.data;
      const list = Array.isArray(data) ? data : (data?.commodities ?? data?.results ?? []);

      setCommodities(list);
    } catch (err) {
      if (!isMounted.current) return;

      console.error("[useConflictData] Failed to fetch commodities:", err.message);

      setErrors((prev) => ({
        ...prev,
        commodities: err.message || "Failed to load commodity data.",
      }));
    } finally {
      if (isMounted.current) {
        setLoading((prev) => ({ ...prev, commodities: false }));
      }
    }
  }, []);

  // ── Full Refresh ──────────────────────────────────────────────────────────

  /**
   * refresh
   * Runs both fetches in parallel and stamps `lastUpdated` once both settle.
   * Can be called manually (e.g. from a "Refresh" button) or by the interval.
   */
  const refresh = useCallback(async () => {
    // Run both requests concurrently — one failure won't block the other
    await Promise.allSettled([fetchEvents(), fetchCommodities()]);

    if (isMounted.current) {
      setLastUpdated(new Date());
    }
  }, [fetchEvents, fetchCommodities]);

  // ── Initial Fetch + Auto-Refresh ──────────────────────────────────────────

  useEffect(() => {
    isMounted.current = true;

    // Fetch immediately on mount
    refresh();

    // Set up auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      console.log("[useConflictData] Auto-refreshing data…");
      refresh();
    }, AUTO_REFRESH_INTERVAL_MS);

    // Cleanup: clear interval and mark as unmounted
    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [refresh]); // `refresh` is stable (useCallback with no changing deps)

  // ── Public API ────────────────────────────────────────────────────────────

  return {
    /** Array of conflict event objects */
    events,

    /** Array of commodity records */
    commodities,

    /** Currently selected/focused event (null if none) */
    selectedEvent,

    /** Setter to drill into a specific event from any component */
    setSelectedEvent,

    /**
     * Granular loading flags
     * @type {{ events: boolean, commodities: boolean }}
     */
    loading,

    /**
     * Granular error messages (null = no error)
     * @type {{ events: string|null, commodities: string|null }}
     */
    errors,

    /** Date object of last successful full refresh, or null before first load */
    lastUpdated,

    /** Manually trigger a full data refresh */
    refresh,
  };
};

export default useConflictData;
