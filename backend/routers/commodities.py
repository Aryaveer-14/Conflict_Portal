"""
commodities.py
---------------
FastAPI router for global commodity data affected by conflicts.
Returns mock commodity price and supply data for the GCIP dashboard.

In production, this would fetch from commodity price APIs or market data sources.
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from typing import List

router = APIRouter(prefix="/commodities", tags=["Commodities"])


# ── Data Models ────────────────────────────────────────────────────────────────

class CommodityPrice(BaseModel):
    """Represents a global commodity affected by conflict."""
    id: str = Field(..., description="Unique commodity identifier")
    name: str = Field(..., description="Commodity name (e.g., Crude Oil, Wheat)")
    category: str = Field(..., description="Category (e.g., energy, agriculture)")
    price: float = Field(..., description="Current price per unit")
    currency: str = Field(default="USD", description="Price currency")
    unit: str = Field(..., description="Unit of measurement")
    change_percent: float = Field(..., description="Price change percentage from baseline")
    affected_region: str = Field(..., description="Region where conflict affects supply")
    supply_impact: str = Field(..., description="Impact level (low, medium, high)")
    date: str = Field(..., description="Data timestamp (ISO format)")


class CommoditiesResponse(BaseModel):
    """Response containing commodity data."""
    success: bool
    data: dict = Field(..., description="Response data containing commodities")


# ── Mock Data ──────────────────────────────────────────────────────────────────

MOCK_COMMODITIES = [
    CommodityPrice(
        id="com_001",
        name="Crude Oil (Brent)",
        category="energy",
        price=88.45,
        currency="USD",
        unit="barrel",
        change_percent=12.5,
        affected_region="Middle East / Red Sea",
        supply_impact="high",
        date=(datetime.now() - timedelta(hours=1)).isoformat()
    ),
    CommodityPrice(
        id="com_002",
        name="Natural Gas",
        category="energy",
        price=3.25,
        currency="USD",
        unit="MMBtu",
        change_percent=8.3,
        affected_region="Eastern Europe",
        supply_impact="medium",
        date=(datetime.now() - timedelta(hours=1)).isoformat()
    ),
    CommodityPrice(
        id="com_003",
        name="Wheat",
        category="agriculture",
        price=215.50,
        currency="USD",
        unit="bushel",
        change_percent=6.2,
        affected_region="Ukraine / Black Sea",
        supply_impact="high",
        date=(datetime.now() - timedelta(hours=1)).isoformat()
    ),
    CommodityPrice(
        id="com_004",
        name="Rare Earth Elements",
        category="minerals",
        price=450.00,
        currency="USD",
        unit="kg",
        change_percent=4.1,
        affected_region="Global supply chains",
        supply_impact="medium",
        date=(datetime.now() - timedelta(hours=1)).isoformat()
    ),
    CommodityPrice(
        id="com_005",
        name="Copper",
        category="minerals",
        price=9850.00,
        currency="USD",
        unit="tonne",
        change_percent=3.7,
        affected_region="Africa / Asia",
        supply_impact="low",
        date=(datetime.now() - timedelta(hours=1)).isoformat()
    ),
    CommodityPrice(
        id="com_006",
        name="Gold",
        category="precious_metals",
        price=2050.00,
        currency="USD",
        unit="troy_oz",
        change_percent=2.5,
        affected_region="Global safe-haven demand",
        supply_impact="low",
        date=(datetime.now() - timedelta(hours=1)).isoformat()
    ),
]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=CommoditiesResponse,
    summary="List global commodities",
    description="Retrieve current prices and supply impact data for conflict-affected commodities."
)
async def get_commodities(
    category: str = Query(None, description="Filter by category (energy, agriculture, minerals, etc.)")
) -> CommoditiesResponse:
    """
    GET /commodities/
    ----------------
    Query params: category (optional filter)
    Returns: { "success": true, "data": { "commodities": [...] } }
    """
    commodities = MOCK_COMMODITIES

    if category:
        commodities = [c for c in commodities if c.category.lower() == category.lower()]

    return CommoditiesResponse(
        success=True,
        data={
            "commodities": [c.dict() for c in commodities],
            "total": len(commodities),
            "last_updated": datetime.now().isoformat()
        }
    )


@router.get(
    "/{commodity_id}",
    response_model=CommoditiesResponse,
    summary="Get a specific commodity",
    description="Retrieve detailed data for a single commodity."
)
async def get_commodity(commodity_id: str) -> CommoditiesResponse:
    """
    GET /commodities/{commodity_id}
    -------------------------------
    Returns: { "success": true, "data": { "commodity": {...} } }
    """
    commodity = next((c for c in MOCK_COMMODITIES if c.id == commodity_id), None)

    if not commodity:
        return CommoditiesResponse(
            success=False,
            data={"error": f"Commodity {commodity_id} not found"}
        )

    return CommoditiesResponse(
        success=True,
        data={"commodity": commodity.dict()}
    )


@router.get(
    "/by-impact/high",
    response_model=CommoditiesResponse,
    summary="Get high-impact commodities",
    description="List commodities with high supply impact from conflicts."
)
async def get_high_impact_commodities() -> CommoditiesResponse:
    """
    GET /commodities/by-impact/high
    ===============================
    Returns: { "success": true, "data": { "commodities": [...] } }
    """
    high_impact = [c for c in MOCK_COMMODITIES if c.supply_impact == "high"]

    return CommoditiesResponse(
        success=True,
        data={
            "commodities": [c.dict() for c in high_impact],
            "count": len(high_impact),
            "impact_level": "high"
        }
    )


@router.get(
    "/trending",
    response_model=CommoditiesResponse,
    summary="Get trending commodities",
    description="List commodities with the largest price changes."
)
async def get_trending_commodities(
    limit: int = Query(5, ge=1, le=20, description="Number of commodities to return")
) -> CommoditiesResponse:
    """
    GET /commodities/trending
    ========================
    Query params: limit (default 5)
    Returns: { "success": true, "data": { "commodities": [...] } }
    """
    # Sort by absolute price change and return top N
    sorted_commodities = sorted(
        MOCK_COMMODITIES,
        key=lambda c: abs(c.change_percent),
        reverse=True
    )[:limit]

    return CommoditiesResponse(
        success=True,
        data={
            "commodities": [c.dict() for c in sorted_commodities],
            "count": len(sorted_commodities)
        }
    )
