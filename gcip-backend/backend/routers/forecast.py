# routers/forecast.py
import random
from datetime import datetime, timedelta
from fastapi import APIRouter, Query
from typing import Optional
from backend.services.cache_service import get_cache, set_cache

router = APIRouter()


@router.get('/')
async def get_forecast(
    event_id: Optional[str] = Query(None, description="Seed event ID"),
    region: Optional[str] = Query(None, description="Region filter"),
    severity: Optional[int] = Query(None, ge=1, le=5, description="Baseline severity 1-5"),
):
    cache_key = f'forecast_{event_id}_{region}_{severity}'
    cached = get_cache(cache_key)
    if cached:
        return cached

    # TODO: Replace stub with ML time-series model
    random.seed(42)
    base = severity if severity is not None else 3
    today = datetime.now()

    predictions = []
    for day in range(30):
        dt = today + timedelta(days=day + 1)
        drift = random.uniform(-0.3, 0.4)
        sev = max(1, min(5, round(base + drift * (day / 10))))
        predictions.append({
            'date': dt.strftime('%Y-%m-%d'),
            'severity': sev,
            'confidence': round(random.uniform(0.6, 0.95), 2),
            'key_drivers': ['troop movements', 'diplomatic talks'] if day % 7 == 0 else [],
        })

    first_half = sum(p['severity'] for p in predictions[:15])
    second_half = sum(p['severity'] for p in predictions[15:])
    trend = ('escalating' if second_half > first_half * 1.1
             else 'de-escalating' if second_half < first_half * 0.9
             else 'stable')

    result = {
        'success': True,
        'data': {
            'event_id': event_id,
            'region': region,
            'horizon_days': 30,
            'predictions': predictions,
            'trend': trend,
        },
        'timestamp': datetime.now().isoformat(),
        'source': 'Forecast Engine',
    }
    set_cache(cache_key, result, ttl=600)
    return result
