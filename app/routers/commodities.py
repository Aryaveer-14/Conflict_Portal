"""
Router: /commodities
Endpoints:
  GET /commodities/    — Brent oil + natural gas prices
"""

from fastapi import APIRouter

from app.schemas.commodities import CommodityResponse
from app.services.commodity_service import fetch_commodity_prices

router = APIRouter(prefix="/commodities", tags=["Commodities"])


@router.get(
    "/",
    response_model=CommodityResponse,
    summary="Get commodity prices",
    description="Retrieve current Brent crude oil and natural gas prices with "
                "daily change percentages.",
)
async def get_commodities():
    return await fetch_commodity_prices()
