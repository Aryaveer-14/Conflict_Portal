"""
Router: /news
Endpoints:
  GET /news/    — Search news articles (query param: ?q=)
"""

from fastapi import APIRouter, Query

from app.schemas.news import NewsResponse
from app.services.news_service import fetch_news

router = APIRouter(prefix="/news", tags=["News"])


@router.get(
    "/",
    response_model=NewsResponse,
    summary="Search news articles",
    description="Search for conflict-related news articles by keyword query.",
)
async def search_news(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100, description="Max articles to return"),
):
    articles = await fetch_news(query=q, limit=limit)
    return NewsResponse(
        query=q,
        total_results=len(articles),
        articles=articles,
    )
