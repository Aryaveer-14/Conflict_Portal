# routers/impact.py
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()

from backend.services.impact_service import calculate_impact_scores

@router.post('/')
async def get_impact(event_id: str, event_data: dict):
    scores = calculate_impact_scores(event_data)
    return {
        'success': True, 
        'data': {
            'scores': scores,
            'event_id': event_id
        },
        'timestamp': datetime.now().isoformat(), 
        'source': 'GCIP-Algorithm'
    }
