"""
Router: /forecast
Endpoints:
  GET /forecast/   — 30-day conflict predictions
                     (query params: ?event_id=&region=&severity=)
"""

from fastapi import APIRouter, Query
from typing import Optional

from app.schemas.forecast import ForecastResponse
from app.services.forecast_service import generate_forecast

router = APIRouter(prefix="/forecast", tags=["Forecast"])


@router.get(
    "/",
    response_model=ForecastResponse,
    summary="30-day conflict forecast",
    description="Generate severity predictions for the next 30 days. "
                "Optionally filter by event, region, or baseline severity.",
)
async def get_forecast(
    event_id: Optional[str] = Query(None, description="Seed event ID"),
    region: Optional[str] = Query(None, description="Region filter"),
    severity: Optional[float] = Query(
        None, ge=0, le=10, description="Baseline severity (0-10)"
    ),
):
    return await generate_forecast(
        event_id=event_id,
        region=region,
        severity=severity,
    )
