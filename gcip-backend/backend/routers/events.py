# routers/events.py
from fastapi import APIRouter, Query
from backend.services.gdelt_service import fetch_conflict_events, parse_gdelt_event
from backend.services.acled_service import fetch_acled_events, parse_acled_event
from backend.services.cache_service import get_cache, set_cache
from datetime import datetime
import asyncio

router = APIRouter()

@router.get('/')
async def get_events(limit: int = Query(20, le=50)):
    cache_key = f'events_merged_{limit}'
    cached = get_cache(cache_key)
    if cached:
        return cached

    # Fetch both services asynchronously
    gdelt_raw, acled_raw = await asyncio.gather(
        fetch_conflict_events(max_records=limit // 2),
        fetch_acled_events(limit=limit // 2)
    )
    
    events = [parse_gdelt_event(a) for a in gdelt_raw]
    events.extend([parse_acled_event(a) for a in acled_raw])

    # Sort combined events by date desc
    events = sorted(events, key=lambda x: x['date'], reverse=True)

    result = {
        'success': True, 
        'data': {'events': events},
        'timestamp': datetime.now().isoformat(), 
        'source': 'GDELT + ACLED'
    }
    
    set_cache(cache_key, result, ttl=900)   # 15 min cache
    return result
