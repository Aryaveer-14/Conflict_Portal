"""
Pydantic models for 30-day conflict forecasting.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class ForecastPoint(BaseModel):
    date: date
    severity: float = Field(..., ge=0, le=10)
    confidence_low: float = Field(..., ge=0, le=10)
    confidence_high: float = Field(..., ge=0, le=10)
    key_drivers: list[str] = Field(default_factory=list)


class ForecastResponse(BaseModel):
    event_id: Optional[str] = None
    region: Optional[str] = None
    severity_filter: Optional[float] = None
    horizon_days: int = 30
    predictions: list[ForecastPoint]
    trend: str = Field("stable", description="escalating / de-escalating / stable")
    model_version: str = "v1.0"
