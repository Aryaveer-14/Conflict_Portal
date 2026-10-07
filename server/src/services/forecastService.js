/**
 * services/forecastService.js
 * ---------------------------
 * Service layer for 30-day conflict forecasting.
 * Port of forecast_service.py — same deterministic stub (seed 42).
 */

/**
 * Simple seeded pseudo-random (same seed as Python random.seed(42))
 * Uses a linear congruential generator for reproducibility.
 */
function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

/**
 * Generate 30-day conflict severity predictions.
 * TODO: Replace stub with ML model (time-series forecasting).
 */
export async function generateForecast({
  event_id = null,
  region = null,
  severity = null,
  horizon_days = 30,
} = {}) {
  const rng = seededRandom(42);
  const baseSeverity = severity !== null ? severity : 5.0;
  const today = new Date();

  const predictions = [];
  for (let day = 0; day < horizon_days; day++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + day + 1);

    const drift = rng() * 0.7 - 0.3; // uniform(-0.3, 0.4)
    const sev = Math.max(0, Math.min(10, baseSeverity + drift * (day / 10)));
    const sevRounded = Math.round(sev * 100) / 100;

    predictions.push({
      date: currentDate.toISOString().split('T')[0],
      severity: sevRounded,
      confidence_low: Math.round(Math.max(0, sevRounded - 1.5) * 100) / 100,
      confidence_high: Math.round(Math.min(10, sevRounded + 1.5) * 100) / 100,
      key_drivers: day % 7 === 0 ? ['troop movements', 'diplomatic talks'] : [],
    });
  }

  // Determine trend
  const half = Math.floor(horizon_days / 2);
  const firstHalf = predictions.slice(0, half).reduce((s, p) => s + p.severity, 0);
  const secondHalf = predictions.slice(half).reduce((s, p) => s + p.severity, 0);
  const trend =
    secondHalf > firstHalf * 1.1 ? 'escalating' :
    secondHalf < firstHalf * 0.9 ? 'de-escalating' : 'stable';

  return {
    event_id,
    region,
    severity_filter: severity,
    horizon_days,
    predictions,
    trend,
    model_version: 'v1.0-stub',
  };
}
