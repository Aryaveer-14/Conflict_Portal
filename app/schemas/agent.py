"""
Pydantic models for the agentic AI query endpoint.
Member C owns the implementation logic.
"""

from pydantic import BaseModel, Field
from typing import Optional


class AgentQuery(BaseModel):
    query: str = Field(..., description="Natural-language question from the user")
    context: dict = Field(
        default_factory=dict,
        description="Additional context (event_id, region, etc.)",
    )
    conversation_id: Optional[str] = Field(
        None,
        description="Optional ID to maintain multi-turn conversation state",
    )


class SourceReference(BaseModel):
    title: str
    url: str = ""
    relevance: float = Field(0.0, ge=0, le=1)


class AgentResponse(BaseModel):
    answer: str
    confidence: float = Field(..., ge=0, le=1)
    sources: list[SourceReference] = Field(default_factory=list)
    suggested_follow_ups: list[str] = Field(default_factory=list)
    conversation_id: Optional[str] = None
