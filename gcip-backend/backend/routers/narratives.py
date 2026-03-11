# routers/narratives.py
from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from uuid import uuid4
from backend.services.cache_service import get_cache, set_cache

router = APIRouter()


@router.get('/')
async def get_narratives(
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    q: Optional[str] = Query(None, description="Free-text search"),
):
    cache_key = f'narratives_{event_id}_{q}'
    cached = get_cache(cache_key)
    if cached:
        return cached

    # TODO (Member C): Replace stub with NLP extraction pipeline
    narratives = [
        {
            'id': str(uuid4()),
            'event_id': event_id,
            'title': 'Escalation narrative detected',
            'summary': 'Multiple sources describe a pattern of military build-up '
                       'along the border region, with humanitarian concerns rising.',
            'key_actors': ['Government Forces', 'Opposition Groups', 'UN Observers'],
            'themes': ['military escalation', 'humanitarian crisis', 'border security'],
            'sentiment': -0.6,
            'confidence': 0.78,
            'created_at': datetime.now().isoformat(),
        }
    ]

    result = {'success': True, 'data': {'narratives': narratives, 'count': len(narratives)},
              'timestamp': datetime.now().isoformat(), 'source': 'NLP Pipeline'}
    set_cache(cache_key, result, ttl=600)
    return result
