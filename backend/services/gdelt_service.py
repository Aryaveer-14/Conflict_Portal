"""
gdelt_service.py
----------------
Fetches near-real-time conflict signals from the GDELT Project API
and transforms them into ConflictEvent-compatible dictionaries for
the GCIP dashboard.

Features:
  - Async HTTP via httpx
  - 5-minute in-memory cache (TTL = 300s)
  - Country → (lat, lon, region) lookup for geocoding
  - Keyword-based severity classification
  - Graceful fallback on API failure
"""

import httpx
import hashlib
import logging
import time
from datetime import datetime
from typing import List, Dict, Optional

logger = logging.getLogger("gcip.gdelt")

# ══════════════════════════════════════════════════════════════════════════════
# Configuration
# ══════════════════════════════════════════════════════════════════════════════

GDELT_API_URL = "https://api.gdeltproject.org/api/v2/doc/doc"
GDELT_QUERY   = "(conflict OR war OR military OR attack OR airstrike OR troops)"
GDELT_PARAMS  = {
    "query":      GDELT_QUERY,
    "mode":       "artlist",
    "format":     "json",
    "maxrecords": "30",          # fetch extra, de-dup later
    "sort":       "DateDesc",
}

CACHE_TTL_SECONDS = 300          # 5-minute cache
REQUEST_TIMEOUT   = 15           # seconds
MAX_EVENTS        = 20           # return at most this many

# ══════════════════════════════════════════════════════════════════════════════
# Country → Coordinates + Region Lookup
# ══════════════════════════════════════════════════════════════════════════════

COUNTRY_COORDS: Dict[str, dict] = {
    # ── Middle East ────────────────────────────────────────────────────────
    "israel":           {"lat": 31.76, "lon": 34.80, "region": "Middle East"},
    "palestine":        {"lat": 31.42, "lon": 34.35, "region": "Middle East"},
    "gaza":             {"lat": 31.42, "lon": 34.35, "region": "Middle East"},
    "iran":             {"lat": 35.69, "lon": 51.39, "region": "Middle East"},
    "iraq":             {"lat": 33.31, "lon": 44.37, "region": "Middle East"},
    "syria":            {"lat": 34.80, "lon": 36.70, "region": "Middle East"},
    "yemen":            {"lat": 15.55, "lon": 42.55, "region": "Middle East"},
    "lebanon":          {"lat": 33.89, "lon": 35.50, "region": "Middle East"},
    "saudi arabia":     {"lat": 24.71, "lon": 46.67, "region": "Middle East"},
    "jordan":           {"lat": 31.95, "lon": 35.93, "region": "Middle East"},
    "turkey":           {"lat": 39.93, "lon": 32.86, "region": "Middle East"},

    # ── Europe ─────────────────────────────────────────────────────────────
    "ukraine":          {"lat": 48.38, "lon": 31.17, "region": "Europe"},
    "russia":           {"lat": 55.76, "lon": 37.62, "region": "Europe"},
    "poland":           {"lat": 52.23, "lon": 21.01, "region": "Europe"},
    "germany":          {"lat": 52.52, "lon": 13.41, "region": "Europe"},
    "france":           {"lat": 48.86, "lon": 2.35,  "region": "Europe"},
    "united kingdom":   {"lat": 51.51, "lon": -0.13, "region": "Europe"},

    # ── Africa ─────────────────────────────────────────────────────────────
    "sudan":            {"lat": 15.50, "lon": 32.56, "region": "East Africa"},
    "south sudan":      {"lat": 4.85,  "lon": 31.60, "region": "East Africa"},
    "ethiopia":         {"lat": 9.02,  "lon": 38.75, "region": "East Africa"},
    "somalia":          {"lat": 2.05,  "lon": 45.32, "region": "East Africa"},
    "kenya":            {"lat": -1.29, "lon": 36.82, "region": "East Africa"},
    "dr congo":         {"lat": -1.68, "lon": 29.22, "region": "Central Africa"},
    "congo":            {"lat": -1.68, "lon": 29.22, "region": "Central Africa"},
    "nigeria":          {"lat": 11.85, "lon": 13.16, "region": "West Africa"},
    "mali":             {"lat": 14.62, "lon": -2.10, "region": "West Africa"},
    "niger":            {"lat": 13.51, "lon": 2.11,  "region": "West Africa"},
    "burkina faso":     {"lat": 12.37, "lon": -1.52, "region": "West Africa"},
    "cameroon":         {"lat": 3.87,  "lon": 11.52, "region": "Central Africa"},
    "mozambique":       {"lat": -25.97,"lon": 32.58, "region": "Southern Africa"},
    "libya":            {"lat": 32.90, "lon": 13.18, "region": "North Africa"},
    "egypt":            {"lat": 30.04, "lon": 31.24, "region": "North Africa"},

    # ── Asia ───────────────────────────────────────────────────────────────
    "china":            {"lat": 39.90, "lon": 116.40,"region": "East Asia"},
    "taiwan":           {"lat": 23.70, "lon": 121.00,"region": "East Asia"},
    "north korea":      {"lat": 39.04, "lon": 125.76,"region": "East Asia"},
    "south korea":      {"lat": 37.57, "lon": 126.98,"region": "East Asia"},
    "japan":            {"lat": 35.68, "lon": 139.69,"region": "East Asia"},
    "india":            {"lat": 28.61, "lon": 77.21, "region": "South Asia"},
    "pakistan":          {"lat": 33.70, "lon": 70.15, "region": "South Asia"},
    "afghanistan":      {"lat": 34.53, "lon": 69.17, "region": "South Asia"},
    "myanmar":          {"lat": 19.76, "lon": 96.07, "region": "Southeast Asia"},
    "philippines":      {"lat": 11.05, "lon": 117.20,"region": "Southeast Asia"},
    "thailand":         {"lat": 13.76, "lon": 100.50,"region": "Southeast Asia"},
    "indonesia":        {"lat": -6.21, "lon": 106.85,"region": "Southeast Asia"},

    # ── Caucasus ───────────────────────────────────────────────────────────
    "armenia":          {"lat": 40.18, "lon": 44.51, "region": "Caucasus"},
    "azerbaijan":       {"lat": 39.90, "lon": 46.58, "region": "Caucasus"},
    "georgia":          {"lat": 41.72, "lon": 44.79, "region": "Caucasus"},

    # ── Americas ───────────────────────────────────────────────────────────
    "united states":    {"lat": 38.91, "lon": -77.04,"region": "North America"},
    "mexico":           {"lat": 19.43, "lon": -99.13,"region": "North America"},
    "colombia":         {"lat": 4.71,  "lon": -74.07,"region": "South America"},
    "venezuela":        {"lat": 10.49, "lon": -66.88,"region": "South America"},
    "brazil":           {"lat": -15.79,"lon": -47.88,"region": "South America"},
    "haiti":            {"lat": 18.97, "lon": -72.30,"region": "Caribbean"},
    "cuba":             {"lat": 23.11, "lon": -82.37,"region": "Caribbean"},
}

# ══════════════════════════════════════════════════════════════════════════════
# Severity Classification
# ══════════════════════════════════════════════════════════════════════════════

HIGH_KEYWORDS     = ["killed", "dead", "death", "massacre", "bombing",
                     "airstrike", "missile", "invasion", "casualties",
                     "genocide", "offensive", "shelling", "destruction"]
CRITICAL_KEYWORDS = ["mass casualt", "nuclear", "chemical weapon",
                     "ethnic cleansing", "war crime"]
MEDIUM_KEYWORDS   = ["attack", "conflict", "troops", "military",
                     "fighting", "clashes", "armed", "battle", "strike"]


def _classify_severity(title: str) -> str:
    """Determine event severity from headline keywords."""
    lower = title.lower()
    for kw in CRITICAL_KEYWORDS:
        if kw in lower:
            return "critical"
    for kw in HIGH_KEYWORDS:
        if kw in lower:
            return "high"
    for kw in MEDIUM_KEYWORDS:
        if kw in lower:
            return "medium"
    return "low"


def _extract_country(article: dict) -> Optional[str]:
    """
    Try to identify the country from GDELT article data.
    Checks sourcecountry first, then scans the title for known countries.
    """
    # GDELT sometimes provides sourcecountry
    src_country = article.get("sourcecountry", "").strip().lower()
    if src_country and src_country in COUNTRY_COORDS:
        return src_country

    # Scan headline for country names
    title_lower = article.get("title", "").lower()
    for country in COUNTRY_COORDS:
        if country in title_lower:
            return country

    # Last resort: try domain-based country code
    return None


def _geocode(country: str) -> Optional[dict]:
    """Look up coordinates + region from country name."""
    return COUNTRY_COORDS.get(country.lower())


def _article_to_event(article: dict, index: int) -> Optional[dict]:
    """
    Convert a GDELT article JSON object into the ConflictEvent dict
    expected by the frontend.

    Returns None if the article cannot be geocoded.
    """
    title = article.get("title", "").strip()
    if not title:
        return None

    # Identify country
    country = _extract_country(article)
    if not country:
        return None

    geo = _geocode(country)
    if not geo:
        return None

    # Parse date from seendate (YYYYMMDDTHHMMSSZ) or fall back to now
    seen = article.get("seendate", "")
    try:
        dt = datetime.strptime(seen[:8], "%Y%m%d")
        date_str = dt.isoformat()
    except (ValueError, IndexError):
        date_str = datetime.utcnow().isoformat()

    # Build unique ID from URL hash
    url = article.get("url", "")
    evt_hash = hashlib.md5(url.encode()).hexdigest()[:8]
    event_id = f"gdelt_{evt_hash}"

    return {
        "id":          event_id,
        "title":       title[:120],           # cap very long titles
        "country":     country.title(),
        "region":      geo["region"],
        "latitude":    geo["lat"],
        "longitude":   geo["lon"],
        "casualties":  0,                     # GDELT doesn't provide this
        "displaced":   0,
        "date":        date_str,
        "description": title,                 # use headline as description
        "severity":    _classify_severity(title),
    }


# ══════════════════════════════════════════════════════════════════════════════
# In-Memory Cache
# ══════════════════════════════════════════════════════════════════════════════

_cache: Dict[str, dict] = {}


def _cache_get(key: str) -> Optional[List[dict]]:
    """Return cached value if TTL hasn't expired."""
    entry = _cache.get(key)
    if entry and (time.time() - entry["ts"]) < CACHE_TTL_SECONDS:
        logger.info("[GDELT] Cache HIT — returning %d cached events", len(entry["data"]))
        return entry["data"]
    return None


def _cache_set(key: str, data: List[dict]):
    """Store data in cache with current timestamp."""
    _cache[key] = {"data": data, "ts": time.time()}
    logger.info("[GDELT] Cache SET — stored %d events (TTL %ds)", len(data), CACHE_TTL_SECONDS)


# ══════════════════════════════════════════════════════════════════════════════
# Public API
# ══════════════════════════════════════════════════════════════════════════════

async def fetch_conflict_events() -> List[dict]:
    """
    Fetch conflict events from GDELT, transform, and return.

    Returns a list of dicts matching the ConflictEvent schema.
    Raises Exception on failure (caller should handle fallback).
    """
    # 1. Check cache
    cached = _cache_get("gdelt_events")
    if cached is not None:
        return cached

    # 2. Call GDELT API
    logger.info("[GDELT] Fetching live data from GDELT API…")
    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.get(GDELT_API_URL, params=GDELT_PARAMS)
        response.raise_for_status()

    payload = response.json()
    articles = payload.get("articles", [])

    if not articles:
        raise ValueError("GDELT returned no articles")

    logger.info("[GDELT] Received %d articles from GDELT", len(articles))

    # 3. Transform articles → events
    events: List[dict] = []
    seen_countries: Dict[str, int] = {}   # limit to 2 events per country

    for idx, article in enumerate(articles):
        evt = _article_to_event(article, idx)
        if evt is None:
            continue

        # De-duplicate: max 2 events per country for variety
        c = evt["country"].lower()
        seen_countries[c] = seen_countries.get(c, 0) + 1
        if seen_countries[c] > 2:
            continue

        events.append(evt)
        if len(events) >= MAX_EVENTS:
            break

    if not events:
        raise ValueError("No geocodable events found in GDELT response")

    # 4. Cache the result
    _cache_set("gdelt_events", events)

    return events
