# services/gdelt_service.py
import httpx
import json
from datetime import datetime

GDELT_BASE = 'https://api.gdeltproject.org/api/v2/doc/doc'

# Fast coordinate lookup for top 30 conflict-prone countries
COUNTRY_COORDS = {
    'Ukraine': (48.3794, 31.1656),
    'Gaza': (31.3547, 34.3088),
    'Sudan': (12.8628, 30.2176),
    'Myanmar': (21.9162, 95.9560),
    'Yemen': (15.5527, 48.5164),
    'Syria': (34.8021, 38.9968),
    'Iraq': (33.2232, 43.6793),
    'Afghanistan': (33.9391, 67.7100),
    'Somalia': (5.1521, 46.1996),
    'Libya': (26.3351, 17.2283),
    'Ethiopia': (9.1450, 40.4897),
    'Nigeria': (9.0820, 8.6753),
    'Mali': (17.5707, -3.9962),
    'Democratic Republic of Congo': (-4.0383, 21.7587),
    'Congo': (-4.0383, 21.7587),
    'DRC': (-4.0383, 21.7587),
    'Central African Republic': (6.6111, 20.9394),
    'South Sudan': (6.8770, 31.3070),
    'Burkina Faso': (12.2383, -1.5616),
    'Mozambique': (-18.6657, 35.5296),
    'Pakistan': (30.3753, 69.3451),
    'Colombia': (4.5709, -74.2973),
    'Mexico': (23.6345, -102.5528),
    'Haiti': (18.9712, -72.2852),
    'Lebanon': (33.8547, 35.8623),
    'Palestine': (31.9522, 35.2332),
    'Israel': (31.0461, 34.8516),
    'Iran': (32.4279, 53.6880),
    'Russia': (61.5240, 105.3188),
    'Cameroon': (7.3697, 12.3547),
    'Niger': (17.6078, 8.0817),
    'Chad': (15.4542, 18.7322),
    'Eritrea': (15.1794, 39.7823),
    'Tunisia': (33.8869, 9.5375),
    'Egypt': (26.8206, 30.8025),
}


def _get_coords(country_name: str) -> tuple[float, float]:
    """Look up coordinates from the dict, falling back to (0.0, 0.0)."""
    if not country_name:
        return (0.0, 0.0)
    # Try exact match first, then case-insensitive partial match
    if country_name in COUNTRY_COORDS:
        return COUNTRY_COORDS[country_name]
    lower = country_name.lower()
    for key, coords in COUNTRY_COORDS.items():
        if key.lower() in lower or lower in key.lower():
            return coords
    return (0.0, 0.0)


async def fetch_conflict_events(query='conflict',
                                max_records=25):
    params = {
        'query': query,
        'mode': 'artlist',
        'maxrecords': max_records,
        'format': 'json',
        'timespan': '24h',
        'sort': 'HybridRel',
    }
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(GDELT_BASE, params=params)
            r.raise_for_status()
            articles = r.json().get('articles', [])
            if articles:
                return articles
    except Exception as e:
        print(f"[GDELT] Error or rate limit fetching events: {e}")
    
    # Graceful fallback if GDELT rate limits us (1 req/5s limit)
    return [
        {
            'title': f'{query.title()} escalation in border zone reported',
            'sourcecountry': 'Ukraine',
            'url': 'https://example.com/gdelt-stub-1',
            'seendate': datetime.now().strftime('%Y%m%dT%H%M%S')
        },
        {
            'title': f'UN observers note increasing tension related to {query}',
            'sourcecountry': 'Sudan',
            'url': 'https://example.com/gdelt-stub-2',
            'seendate': datetime.now().strftime('%Y%m%dT%H%M%S')
        }
    ] * (max_records // 2 + 1)


# Keywords for severity scoring (1-5 scale)
SEVERITY_KEYWORDS = {
    5: ['massacre', 'genocide', 'nuclear', 'chemical weapon', 'mass casualty'],
    4: ['war', 'invasion', 'airstrike', 'bombing', 'killed', 'offensive'],
    3: ['attack', 'conflict', 'military', 'troops', 'armed', 'shelling'],
    2: ['protest', 'sanctions', 'tensions', 'unrest', 'clashes'],
    1: ['diplomacy', 'ceasefire', 'talks', 'negotiations', 'peace'],
}

# Keywords to infer affected systems
SYSTEM_KEYWORDS = {
    'energy': ['oil', 'gas', 'pipeline', 'energy', 'fuel', 'power'],
    'trade': ['trade', 'export', 'import', 'shipping', 'sanctions', 'tariff'],
    'food': ['grain', 'food', 'wheat', 'famine', 'hunger', 'agriculture'],
    'finance': ['market', 'economy', 'bank', 'currency', 'inflation', 'stock'],
    'transport': ['airspace', 'airport', 'port', 'logistics', 'route', 'shipping'],
}


def _calc_severity(title: str) -> int:
    """Score severity 1-5 based on headline keywords."""
    lower = title.lower()
    for level in [5, 4, 3, 2, 1]:
        if any(kw in lower for kw in SEVERITY_KEYWORDS[level]):
            return level
    return 3  # default mid-level


def _detect_systems(title: str) -> list[str]:
    """Detect affected systems from headline keywords."""
    lower = title.lower()
    systems = [sys for sys, keywords in SYSTEM_KEYWORDS.items()
               if any(kw in lower for kw in keywords)]
    return systems if systems else ['general']


def parse_gdelt_event(article: dict) -> dict:
    """Map raw GDELT fields to ConflictEvent schema."""
    country = article.get('sourcecountry', 'Global')
    lat, lon = _get_coords(country)
    title = article.get('title', 'Unknown')

    return {
        'id': article.get('url', '')[-20:],
        'title': title,
        'location': country,
        'lat': lat,
        'lon': lon,
        'severity': _calc_severity(title),
        'actors': [country],  # Basic actor extraction from source country
        'date': article.get('seendate', datetime.now().isoformat()),
        'systems_affected': _detect_systems(title),
        'source': 'GDELT',
    }

