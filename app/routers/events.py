"""
Router: /events
Endpoints:
  GET /events/         — List conflict events from GDELT
  GET /events/{id}     — Single event by ID
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from app.schemas.events import ConflictEvent, EventListResponse
from app.services.gdelt_service import fetch_events, fetch_event_by_id

router = APIRouter(prefix="/events", tags=["Events"])


@router.get(
    "/",
    response_model=EventListResponse,
    summary="Fetch conflict events",
    description="Retrieve conflict events sourced from the GDELT Project. "
                "Supports pagination, country, region, and date-range filters.",
)
async def list_events(
    limit: int = Query(25, ge=1, le=100, description="Max events to return"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    country: Optional[str] = Query(None, description="ISO country code filter"),
    region: Optional[str] = Query(None, description="Region name filter"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    events = await fetch_events(
        limit=limit,
        offset=offset,
        country=country,
        region=region,
        start_date=start_date,
        end_date=end_date,
    )
    return EventListResponse(count=len(events), events=events)


@router.get(
    "/{event_id}",
    response_model=ConflictEvent,
    summary="Get a single event",
    description="Retrieve detailed information for a specific conflict event by ID.",
)
async def get_event(event_id: str):
    event = await fetch_event_by_id(event_id)
    if event is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return event
