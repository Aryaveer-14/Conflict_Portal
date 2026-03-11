# services/cache_service.py
import time
from typing import Optional

_cache: dict = {}


def get_cache(key: str) -> Optional[dict]:
    if key in _cache:
        entry = _cache[key]
        if time.time() < entry['expires']:
            return entry['data']
        del _cache[key]
    return None


def set_cache(key: str, data: dict, ttl: int = 900):
    _cache[key] = {'data': data, 'expires': time.time() + ttl}


def clear_cache():
    _cache.clear()
