# routers/simulate.py
from fastapi import APIRouter
from datetime import datetime
from backend.models.schemas import SimulationRequest

router = APIRouter()

SCENARIO_TEMPLATES = {
    'oil_embargo': {
        'day_1':  {'oil_change': +5,  'shipping_disruption': 15, 'alert': 3},
        'day_7':  {'oil_change': +18, 'shipping_disruption': 30, 'alert': 4},
        'day_30': {'oil_change': +35, 'shipping_disruption': 45, 'alert': 5},
        'day_90': {'oil_change': +12, 'shipping_disruption': 20, 'alert': 3},
    },
    'strait_blockade': {
        'day_1':  {'oil_change': +12, 'shipping_disruption': 60, 'alert': 4},
        'day_7':  {'oil_change': +25, 'shipping_disruption': 75, 'alert': 5},
        'day_30': {'oil_change': +40, 'shipping_disruption': 80, 'alert': 5},
        'day_90': {'oil_change': +15, 'shipping_disruption': 40, 'alert': 3},
    },
    'trade_war': {
        'day_1':  {'oil_change': +2,  'shipping_disruption': 10, 'alert': 2},
        'day_7':  {'oil_change': +5,  'shipping_disruption': 20, 'alert': 3},
        'day_30': {'oil_change': +8,  'shipping_disruption': 35, 'alert': 4},
        'day_90': {'oil_change': +10, 'shipping_disruption': 45, 'alert': 4},
    },
    'cyber_attack': {
        'day_1':  {'oil_change': +1,  'shipping_disruption': 40, 'alert': 4},
        'day_7':  {'oil_change': +3,  'shipping_disruption': 60, 'alert': 5},
        'day_30': {'oil_change': +2,  'shipping_disruption': 15, 'alert': 3},
        'day_90': {'oil_change': 0,   'shipping_disruption': 5,  'alert': 2},
    }
}

@router.post('/')
async def run_simulation(request: SimulationRequest):
    template = SCENARIO_TEMPLATES.get(request.scenario_type, {})
    # Scale by severity multiplier (severity 1-5, base is severity 3)
    multiplier = request.severity / 3.0
    timeline = []
    
    for day_key, values in template.items():
        day_num = int(day_key.split('_')[1])
        timeline.append({
            'day': day_num,
            'oil_change_pct': round(values['oil_change'] * multiplier, 1),
            'shipping_disruption_pct': min(100, round(values['shipping_disruption'] * multiplier)),
            'alert_level': min(5, round(values['alert'] * (multiplier ** 0.5)))
        })
        
    return {
        'success': True, 
        'data': {
            'timeline': timeline,
            'scenario': request.scenario_type, 
            'severity': request.severity
        },
        'timestamp': datetime.now().isoformat(), 
        'source': 'GCIP-Simulator'
    }
