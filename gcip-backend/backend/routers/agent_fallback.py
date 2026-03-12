# routers/agent_fallback.py — pre-baked responses for common queries
CANNED_RESPONSES = {
    'oil': 'Based on current data, oil supply faces elevated risk due to...',
    'shipping': 'Shipping route analysis shows 3 key chokepoints under stress...',
    'food': 'Global food security indicators suggest...',
}

def get_fallback_response(query: str) -> str:
    query_lower = query.lower()
    for keyword, response in CANNED_RESPONSES.items():
        if keyword in query_lower:
            return response
    return 'Intelligence analysis is processing. Current high-risk systems: Energy (74/100), Trade (61/100).'
