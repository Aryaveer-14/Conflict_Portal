# routers/impact.py
from fastapi import APIRouter
from datetime import datetime
from backend.models.schemas import ImpactScore

router = APIRouter()


@router.post('/')
async def analyse_impact(payload: dict):
    """Compute cascade impact scores for a conflict event."""
    event_id = payload.get('event_id', '')

    # TODO: Integrate real impact-modelling pipeline
    dimensions = [
        ImpactScore(system='energy', score=72, trend='rising',
                    key_risk='Oil supply disruption from conflict zone'),
        ImpactScore(system='trade', score=58, trend='rising',
                    key_risk='Shipping lane closures affecting 15% of global trade'),
        ImpactScore(system='food', score=65, trend='rising',
                    key_risk='Grain export blockade impacting food security'),
        ImpactScore(system='finance', score=45, trend='stable',
                    key_risk='Market volatility and sanctions pressure'),
        ImpactScore(system='transport', score=51, trend='falling',
                    key_risk='Airspace restrictions and rerouted logistics'),
    ]

    result = {
        'success': True,
        'data': {
            'event_id': event_id,
            'impacts': [d.model_dump() for d in dimensions],
            'overall_risk': sum(d.score for d in dimensions) // len(dimensions),
        },
        'timestamp': datetime.now().isoformat(),
        'source': 'Impact Engine',
    }
    return result
