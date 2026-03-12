# models/schemas.py
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class ConflictEvent(BaseModel):
    id: str
    title: str
    location: str
    lat: float
    lon: float
    severity: int          # 1-5
    actors: List[str]
    date: str              # ISO-8601
    systems_affected: List[str]
    source: str


class ImpactScore(BaseModel):
    system: str            # energy | trade | food | finance | transport
    score: int             # 0-100
    trend: str             # rising | stable | falling
    key_risk: str


class APIResponse(BaseModel):
    success: bool
    data: dict
    timestamp: str
    source: str


# ── Commodity schemas ────────────────────────────────────
class CommodityDataPoint(BaseModel):
    """Single data point from Alpha Vantage commodity series."""
    date: str              # e.g. "2026-03-11"
    value: Optional[str]   # price as string (AV returns "." for missing)


class CommoditySeries(BaseModel):
    """One commodity's time-series data."""
    commodity: str         # e.g. "Brent Crude Oil"
    unit: str              # e.g. "USD per barrel"
    interval: str          # "daily" | "weekly" | "monthly"
    series: List[CommodityDataPoint]
    latest_price: Optional[float] = None
    change_percent: Optional[float] = None


class CommodityResponse(BaseModel):
    """Aggregated response for all tracked commodities."""
    brent_oil: CommoditySeries
    natural_gas: CommoditySeries
    wheat: CommoditySeries
    timestamp: str

class SimulationRequest(BaseModel):
    scenario_type: str
    severity: int
