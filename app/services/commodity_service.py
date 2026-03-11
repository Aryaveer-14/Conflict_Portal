"""
Service layer for fetching commodity prices (Brent oil & natural gas).
"""

from datetime import datetime

from app.schemas.commodities import CommodityPrice, CommodityResponse


async def fetch_commodity_prices() -> CommodityResponse:
    """
    Fetch current Brent oil and natural gas prices.

    TODO: Wire up a real commodity data provider
    (e.g. Alpha Vantage, Yahoo Finance, or EIA API).
    """
    return CommodityResponse(
        brent_oil=CommodityPrice(
            commodity="brent_oil",
            price=82.45,
            currency="USD",
            change_percent=-1.23,
            timestamp=datetime.utcnow(),
        ),
        natural_gas=CommodityPrice(
            commodity="natural_gas",
            price=2.87,
            currency="USD",
            change_percent=0.56,
            timestamp=datetime.utcnow(),
        ),
    )
