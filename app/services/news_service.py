"""
Service layer for fetching news articles.
"""

from datetime import datetime

from app.config import get_settings
from app.schemas.news import NewsArticle


async def fetch_news(query: str, limit: int = 20) -> list[NewsArticle]:
    """
    Search news articles related to the query.

    TODO: Integrate with NewsAPI, GDELT DOC API, or similar.
    """
    settings = get_settings()

    return [
        NewsArticle(
            title=f"Breaking: {query} — latest developments ({i + 1})",
            description=f"In-depth coverage of {query} and its global implications.",
            source="Reuters" if i % 2 == 0 else "AP News",
            url=f"https://example.com/news/{i}",
            published_at=datetime.utcnow(),
            image_url=None,
            sentiment=0.1 * (i % 5 - 2),
        )
        for i in range(min(limit, 10))
    ]
