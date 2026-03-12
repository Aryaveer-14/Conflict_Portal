SYSTEM_WEIGHTS = {
    'energy': {
        'middle_east': 0.9, 'russia': 0.85, 'ukraine': 0.7,
        'severity_multiplier': 15, 'base_score': 10
    },
    'trade': {
        'strait_keywords': ['hormuz', 'malacca', 'suez', 'bosporus'],
        'severity_multiplier': 12, 'base_score': 8
    },
    'food': {
        'ukraine': 0.8, 'russia': 0.7, 'sudan': 0.6, 'ethiopia': 0.5,
        'severity_multiplier': 10, 'base_score': 5
    },
    'finance': { 'severity_multiplier': 8, 'base_score': 5 },
    'transport': { 'severity_multiplier': 10, 'base_score': 5 }
}

def calculate_impact_scores(event: dict) -> list:
    location_lower = event.get('location', '').lower()
    severity = event.get('severity', 3)
    scores = []

    # Energy score
    energy_base = SYSTEM_WEIGHTS['energy']['base_score']
    if any(r in location_lower for r in ['iraq', 'iran', 'saudi', 'gulf', 'yemen']):
        energy_base += 40
    elif 'russia' in location_lower or 'ukraine' in location_lower:
        energy_base += 30
    energy_score = min(100, energy_base + severity *
                       SYSTEM_WEIGHTS['energy']['severity_multiplier'])
    scores.append({'system': 'energy', 'score': energy_score,
                   'trend': 'rising', 'key_risk': 'Oil supply disruption'})

    # Trade score
    trade_base = SYSTEM_WEIGHTS['trade']['base_score']
    if any(k in location_lower for k in SYSTEM_WEIGHTS['trade']['strait_keywords']):
        trade_base += 40
    trade_score = min(100, trade_base + severity * SYSTEM_WEIGHTS['trade']['severity_multiplier'])
    scores.append({'system': 'trade', 'score': trade_score,
                   'trend': 'rising', 'key_risk': 'Shipping lane closures affecting 15% of global trade'})

    # Food score
    food_base = SYSTEM_WEIGHTS['food']['base_score']
    if 'ukraine' in location_lower:
        food_base += 40
    elif 'russia' in location_lower:
        food_base += 30
    elif any(r in location_lower for r in ['sudan', 'ethiopia', 'africa']):
        food_base += 20
    food_score = min(100, food_base + severity * SYSTEM_WEIGHTS['food']['severity_multiplier'])
    scores.append({'system': 'food', 'score': food_score,
                   'trend': 'rising', 'key_risk': 'Grain export blockade impacting food security'})

    # Finance score
    finance_base = SYSTEM_WEIGHTS['finance']['base_score']
    finance_score = min(100, finance_base + severity * SYSTEM_WEIGHTS['finance']['severity_multiplier'])
    scores.append({'system': 'finance', 'score': finance_score,
                   'trend': 'stable', 'key_risk': 'Market volatility and sanctions pressure'})

    # Transport score
    transport_base = SYSTEM_WEIGHTS['transport']['base_score']
    transport_score = min(100, transport_base + severity * SYSTEM_WEIGHTS['transport']['severity_multiplier'])
    scores.append({'system': 'transport', 'score': transport_score,
                   'trend': 'falling', 'key_risk': 'Airspace restrictions and rerouted logistics'})

    return scores
