"""
Pydantic models for cascade impact analysis.
"""

from pydantic import BaseModel, Field
from typing import Optional


class ImpactRequest(BaseModel):
    event_id: str = Field(..., description="ID of the conflict event to analyse")
    region: Optional[str] = Field(None, description="Optional region filter")
    include_economic: bool = Field(True, description="Include economic impact metrics")
    include_humanitarian: bool = Field(True, description="Include humanitarian impact metrics")


class ImpactDimension(BaseModel):
    dimension: str  # e.g. "economic", "humanitarian", "political", "environmental"
    score: float = Field(..., ge=0, le=10)
    confidence: float = Field(..., ge=0, le=1)
    description: str = ""
    affected_countries: list[str] = Field(default_factory=list)


class ImpactResponse(BaseModel):
    event_id: str
    overall_score: float = Field(..., ge=0, le=10)
    risk_level: str = Field(..., description="low / medium / high / critical")
    dimensions: list[ImpactDimension]
    cascade_chain: list[str] = Field(
        default_factory=list,
        description="Ordered list of knock-on effects",
    )
