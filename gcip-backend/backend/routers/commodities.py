# routers/commodities.py
from fastapi import APIRouter
from datetime import datetime
from backend.services.commodity_service import fetch_brent_oil, fetch_natural_gas

router = APIRouter()


@router.get('/')
async def get_commodities():
    """Brent oil & natural gas prices from Alpha Vantage (1h cache)."""
    oil = await fetch_brent_oil()
    gas = await fetch_natural_gas()
    return {'success': True, 'data': {'oil': oil, 'gas': gas},
            'timestamp': datetime.now().isoformat(), 'source': 'AlphaVantage'}
