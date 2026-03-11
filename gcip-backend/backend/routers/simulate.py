# routers/simulate.py
from uuid import uuid4
from datetime import datetime
from fastapi import APIRouter

router = APIRouter()


@router.post('/')
async def simulate(payload: dict):
    """Run a what-if scenario simulation."""
    scenario_desc = payload.get('scenario_description', 'Unknown scenario')
    variables = payload.get('variables', {})
    time_horizon = payload.get('time_horizon_days', 30)

    # TODO: Integrate with agent-based model or LLM-driven simulation
    outcomes = [
        {
            'step': 1,
            'description': 'Initial shock: energy markets react with 8% price spike.',
            'severity': min(5, round(3 + variables.get('oil_price_shock', 0) * 2)),
            'probability': 0.85,
            'affected_regions': ['Europe', 'Middle East'],
        },
        {
            'step': 2,
            'description': 'Diplomatic channels activated; UN emergency session called.',
            'severity': 3,
            'probability': 0.70,
            'affected_regions': ['Global'],
        },
        {
            'step': 3,
            'description': 'Humanitarian crisis deepens; refugee flows increase by 40%.',
            'severity': 4,
            'probability': 0.65,
            'affected_regions': ['Eastern Europe', 'Central Asia'],
        },
        {
            'step': 4,
            'description': 'Economic sanctions imposed; secondary market effects emerge.',
            'severity': 3,
            'probability': 0.55,
            'affected_regions': ['Europe', 'North America'],
        },
    ]

    overall_risk = sum(o['severity'] * o['probability'] for o in outcomes) / len(outcomes)

    result = {
        'success': True,
        'data': {
            'scenario_id': str(uuid4()),
            'scenario_description': scenario_desc,
            'outcomes': outcomes,
            'overall_risk': round(overall_risk, 2),
            'time_horizon_days': time_horizon,
        },
        'timestamp': datetime.now().isoformat(),
        'source': 'Simulation Engine',
    }
    return result
