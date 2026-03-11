# services/news_service.py
import httpx
import os
import logging
from backend.services.cache_service import get_cache, set_cache

logger = logging.getLogger(__name__)

NEWS_KEY = os.getenv('NEWSAPI_KEY')


async def fetch_conflict_news(query='geopolitical conflict', page_size=20):
    """
    Fetch conflict-related news articles from NewsAPI.
    Returns a list of dicts with title, description, source, url, publishedAt.
    Cached for 30 minutes.
    """
    cache_key = f'news_{query}'
    cached = get_cache(cache_key)
    if cached:
        return cached

    # Guard: no API key
    if not NEWS_KEY or NEWS_KEY == 'your_newsapi_key':
        logger.warning('NEWSAPI_KEY not set — returning empty list')
        return []

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get('https://newsapi.org/v2/everything', params={
                'q': query, 'sortBy': 'publishedAt',
                'pageSize': page_size, 'language': 'en',
                'apiKey': NEWS_KEY
            })
            r.raise_for_status()
            articles = r.json().get('articles', [])
            result = [{'title': a['title'], 'description': a['description'],
                        'source': a['source']['name'], 'url': a['url'],
                        'publishedAt': a['publishedAt']} for a in articles]
            set_cache(cache_key, result, ttl=1800)  # 30 min cache
            return result

    except httpx.HTTPStatusError as e:
        logger.error('NewsAPI HTTP error: %s', e)
        return []
    except httpx.RequestError as e:
        logger.error('NewsAPI request error: %s', e)
        return []
    except Exception as e:
        logger.error('Unexpected error fetching news: %s', e)
        return []
