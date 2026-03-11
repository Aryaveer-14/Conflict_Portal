"""
Pydantic models for news article data.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class NewsArticle(BaseModel):
    title: str
    description: Optional[str] = None
    source: str = ""
    url: str = ""
    published_at: Optional[datetime] = None
    image_url: Optional[str] = None
    sentiment: Optional[float] = Field(None, ge=-1, le=1, description="Sentiment score -1 to 1")


class NewsResponse(BaseModel):
    query: str
    total_results: int
    articles: list[NewsArticle]
