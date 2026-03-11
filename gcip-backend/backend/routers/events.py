# routers/events.py
from fastapi import APIRouter, Query
from backend.services.gdelt_service import fetch_conflict_events, parse_gdelt_event
from backend.services.cache_service import get_cache, set_cache
from datetime import datetime

router = APIRouter()


@router.get('/')
async def get_events(limit: int = Query(20, le=50)):
    cache_key = f'events_{limit}'
    cached = get_cache(cache_key)
    if cached:
        return cached

    raw = await fetch_conflict_events(max_records=limit)
    events = [parse_gdelt_event(a) for a in raw]

    result = {'success': True, 'data': {'events': events},
              'timestamp': datetime.now().isoformat(), 'source': 'GDELT'}
    set_cache(cache_key, result, ttl=900)   # 15 min cache
    return result
