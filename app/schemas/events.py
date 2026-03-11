"""
Pydantic models for conflict-event data.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ConflictEvent(BaseModel):
    """A single conflict event returned from GDELT or our datastore."""
    id: str = Field(..., description="Unique event identifier")
    title: str = Field(..., description="Headline / short description")
    event_date: datetime = Field(..., description="When the event occurred")
    source_url: str = Field("", description="Original source URL")
    country: str = Field("", description="Primary country code")
    region: str = Field("", description="Geographic region")
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    severity: float = Field(0.0, ge=0, le=10, description="Severity 0-10")
    goldstein_scale: Optional[float] = Field(None, description="GDELT Goldstein scale")
    num_articles: int = Field(0, description="Number of related articles")
    categories: list[str] = Field(default_factory=list)


class EventListResponse(BaseModel):
    count: int
    events: list[ConflictEvent]
