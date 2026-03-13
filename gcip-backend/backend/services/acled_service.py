# services/acled_service.py
import httpx
import os
from datetime import datetime
from backend.services.gdelt_service import _get_coords, _calc_severity, _detect_systems

ACLED_BASE = "https://api.acleddata.com/acled/read/"

async def fetch_acled_events(limit=25):
    """Fetch conflict events from ACLED using API credentials from .env."""
    email = os.getenv("ACLED_EMAIL")
    password = os.getenv("ACLED_PASSWORD")
    
    if not email or not password or password == "your_acled_password":
        print("[ACLED] No valid email/password found. Returning mock fallback data.")
        return _get_mock_acled_data(limit)

    login_url = "https://acleddata.com/user/login?_format=json"
    login_payload = {"name": email, "pass": password}
    
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Step 1: Login and get session cookie
            login_resp = await client.post(login_url, json=login_payload)
            login_resp.raise_for_status()
            
            # Step 2: Query API with session cookie
            params = {
                'limit': limit,
                'format': 'json',
                'event_date': f"{datetime.now().year}-01-01|{datetime.now().strftime('%Y-%m-%d')}",
                'event_date_where': 'BETWEEN',
            }
            r = await client.get(ACLED_BASE, params=params)
            r.raise_for_status()
            data = r.json()
            if 'data' in data:
                return data['data']
            return _get_mock_acled_data(limit)
            
    except Exception as e:
        print(f"[ACLED] Request failed: {e}. Falling back to mock data.")
        return _get_mock_acled_data(limit)

def _get_mock_acled_data(limit):
    """Return mock ACLED payloads if the API fails or auth is missing."""
    return [
        {
            'event_id_cnty': f'ACLED-MOCK-{i}',
            'event_date': datetime.now().strftime('%Y-%m-%d'),
            'country': 'Syria' if i % 2 == 0 else 'Myanmar',
            'location': 'Damascus' if i % 2 == 0 else 'Yangon',
            'latitude': 33.5138 if i % 2 == 0 else 16.8409,
            'longitude': 36.2765 if i % 2 == 0 else 96.1492,
            'event_type': 'Battles',
            'sub_event_type': 'Armed clash',
            'actor1': 'State Forces',
            'actor2': 'Rebel Militia',
            'notes': 'Heavy armed clashes reported near the border.',
            'fatalities': 5,
        } for i in range(1, limit + 1)
    ]

def parse_acled_event(raw_event: dict) -> dict:
    """Map raw ACLED fields to the unified ConflictEvent schema."""
    country = raw_event.get('country', 'Unknown')
    title = raw_event.get('notes', f"{raw_event.get('event_type')} in {country}")
    
    return {
        'id': raw_event.get('event_id_cnty', str(id(raw_event))),
        'title': title,
        'location': country,
        'lat': float(raw_event.get('latitude', 0.0)),
        'lon': float(raw_event.get('longitude', 0.0)),
        'severity': _calc_severity(title) if raw_event.get('fatalities', 0) < 10 else 5,
        'actors': [raw_event.get('actor1', 'Unknown'), raw_event.get('actor2', 'Unknown')],
        'date': raw_event.get('event_date', datetime.now().isoformat()),
        'systems_affected': _detect_systems(title),
        'source': 'ACLED',
    }
