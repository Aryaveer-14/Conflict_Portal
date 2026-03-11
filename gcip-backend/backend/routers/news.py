# routers/news.py
from fastapi import APIRouter, Query
from datetime import datetime
from backend.services.news_service import fetch_conflict_news

router = APIRouter()


@router.get('/')
async def get_news(
    q: str = Query('geopolitical conflict', description='Search query'),
    limit: int = Query(20, le=50, description='Max articles'),
):
    """Conflict-related news articles from NewsAPI (30 min cache)."""
    articles = await fetch_conflict_news(query=q, page_size=limit)
    return {'success': True, 'data': {'articles': articles, 'count': len(articles)},
            'timestamp': datetime.now().isoformat(), 'source': 'NewsAPI'}
