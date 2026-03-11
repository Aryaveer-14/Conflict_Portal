"""
Commodity price service — Brent oil, Natural Gas, Wheat via Alpha Vantage.

Alpha Vantage commodity endpoints:
  • BRENT         → Brent crude oil (daily/weekly/monthly)
  • NATURAL_GAS   → Henry Hub natural gas (daily/weekly/monthly)
  • WHEAT         → Global wheat price (monthly — AV only offers monthly for wheat)

Docs: https://www.alphavantage.co/documentation/#commodities
Free tier: 25 requests/day, 5 requests/minute.
"""

import os
import logging
from datetime import datetime
from typing import Optional

import httpx

from backend.models.schemas import (
    CommodityDataPoint,
    CommoditySeries,
    CommodityResponse,
)
from backend.services.cache_service import get_cache, set_cache

logger = logging.getLogger(__name__)

AV_KEY = os.getenv("ALPHA_VANTAGE_KEY")
AV_BASE = "https://www.alphavantage.co/query"

# ── Config for each commodity ────────────────────────────
COMMODITY_CONFIG = {
    "brent_oil": {
        "function": "BRENT",
        "interval": "daily",
        "name": "Brent Crude Oil",
        "unit": "USD per barrel",
    },
    "natural_gas": {
        "function": "NATURAL_GAS",
        "interval": "daily",
        "name": "Henry Hub Natural Gas",
        "unit": "USD per million BTU",
    },
    "wheat": {
        "function": "WHEAT",
        "interval": "monthly",           # AV only offers monthly for wheat
        "name": "Global Wheat",
        "unit": "USD per metric ton",
    },
}


# ── Internal helpers ─────────────────────────────────────
async def _fetch_single_commodity(
    key: str,
    client: httpx.AsyncClient,
    limit: int = 30,
) -> CommoditySeries:
    """
    Fetch one commodity from Alpha Vantage.
    Returns a CommoditySeries with up to `limit` data points,
    calculated latest price, and daily/monthly change %.
    Falls back to a stub if the API key is missing or the call fails.
    """

    cfg = COMMODITY_CONFIG[key]

    # ── Check cache first ────────────────────────────────
    cache_key = f"commodity_{key}"
    cached = get_cache(cache_key)
    if cached:
        logger.debug("Cache hit for %s", key)
        return CommoditySeries(**cached)

    # ── Guard: no API key → return stub ──────────────────
    if not AV_KEY or AV_KEY == "your_alpha_vantage_key":
        logger.warning("ALPHA_VANTAGE_KEY not set — returning stub for %s", key)
        return _stub_series(cfg)

    # ── Call Alpha Vantage ───────────────────────────────
    try:
        resp = await client.get(
            AV_BASE,
            params={
                "function": cfg["function"],
                "interval": cfg["interval"],
                "apikey": AV_KEY,
            },
        )
        resp.raise_for_status()
        data = resp.json()

        # AV returns {"name": "...", "interval": "...", "unit": "...", "data": [...]}
        raw_series = data.get("data", [])

        if not raw_series:
            logger.warning("Empty series from AV for %s — possible rate limit", key)
            # Check for AV error messages
            if "Note" in data or "Information" in data:
                logger.warning("AV message: %s", data.get("Note") or data.get("Information"))
            return _stub_series(cfg)

        # Keep only the most recent `limit` points
        points = [
            CommodityDataPoint(date=p["date"], value=p["value"])
            for p in raw_series[:limit]
        ]

        # Calculate latest price & change %
        latest_price = _safe_float(points[0].value)
        change_percent = _calc_change(points)

        series = CommoditySeries(
            commodity=cfg["name"],
            unit=cfg["unit"],
            interval=cfg["interval"],
            series=points,
            latest_price=latest_price,
            change_percent=change_percent,
        )

        # Cache for 1 hour
        set_cache(cache_key, series.model_dump(), ttl=3600)
        return series

    except httpx.HTTPStatusError as e:
        logger.error("AV HTTP error for %s: %s", key, e)
        return _stub_series(cfg)
    except httpx.RequestError as e:
        logger.error("AV request error for %s: %s", key, e)
        return _stub_series(cfg)
    except Exception as e:
        logger.error("Unexpected error fetching %s: %s", key, e)
        return _stub_series(cfg)


def _safe_float(val: Optional[str]) -> Optional[float]:
    """Convert AV string value to float, returning None for missing (\".\") data."""
    if val is None or val.strip() == ".":
        return None
    try:
        return round(float(val), 4)
    except ValueError:
        return None


def _calc_change(points: list[CommodityDataPoint]) -> Optional[float]:
    """Calculate % change between the two most recent valid data points."""
    values = []
    for p in points:
        v = _safe_float(p.value)
        if v is not None:
            values.append(v)
        if len(values) == 2:
            break
    if len(values) < 2 or values[1] == 0:
        return None
    return round(((values[0] - values[1]) / values[1]) * 100, 2)


def _stub_series(cfg: dict) -> CommoditySeries:
    """Return a placeholder series when AV data is unavailable."""
    return CommoditySeries(
        commodity=cfg["name"],
        unit=cfg["unit"],
        interval=cfg["interval"],
        series=[],
        latest_price=None,
        change_percent=None,
    )


# ── Public API ───────────────────────────────────────────
async def fetch_brent_oil() -> dict:
    """Fetch Brent crude oil daily series from Alpha Vantage."""
    async with httpx.AsyncClient(timeout=15) as client:
        series = await _fetch_single_commodity("brent_oil", client)
    return series.model_dump()


async def fetch_natural_gas() -> dict:
    """Fetch Henry Hub natural gas daily series from Alpha Vantage."""
    async with httpx.AsyncClient(timeout=15) as client:
        series = await _fetch_single_commodity("natural_gas", client)
    return series.model_dump()


async def fetch_wheat() -> dict:
    """Fetch global wheat monthly series from Alpha Vantage."""
    async with httpx.AsyncClient(timeout=15) as client:
        series = await _fetch_single_commodity("wheat", client)
    return series.model_dump()
