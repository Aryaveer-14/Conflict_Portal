"""
Pydantic models for extracted narratives.
Member C fills the extraction logic; these schemas define the contract.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Narrative(BaseModel):
    id: str
    event_id: Optional[str] = None
    title: str
    summary: str = ""
    key_actors: list[str] = Field(default_factory=list)
    themes: list[str] = Field(default_factory=list)
    sentiment: Optional[float] = Field(None, ge=-1, le=1)
    confidence: float = Field(0.0, ge=0, le=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class NarrativeResponse(BaseModel):
    count: int
    narratives: list[Narrative]
