"""
events.py
---------
FastAPI router for global conflict events.
Returns mock conflict event data for the GCIP dashboard.

In production, this would fetch from a database or external data source.
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from typing import Optional

router = APIRouter(prefix="/events", tags=["Events"])


# ── Data Models ────────────────────────────────────────────────────────────────

class ConflictEvent(BaseModel):
    """Represents a global conflict event."""
    id: str = Field(..., description="Unique event identifier")
    title: str = Field(..., description="Event title/headline")
    country: str = Field(..., description="Primary country affected")
    region: str = Field(..., description="Geographic region")
    latitude: float = Field(..., description="Event latitude")
    longitude: float = Field(..., description="Event longitude")
    casualties: int = Field(default=0, description="Estimated casualties")
    displaced: int = Field(default=0, description="Internally displaced persons")
    date: str = Field(..., description="Event date (ISO format)")
    description: str = Field(..., description="Event description")
    severity: str = Field(..., description="Severity level (low, medium, high, critical)")


class EventsResponse(BaseModel):
    """Response containing a list of conflict events."""
    success: bool
    data: dict = Field(..., description="Response data containing events")


# ── Mock Data ──────────────────────────────────────────────────────────────────

MOCK_EVENTS = [
    ConflictEvent(
        id="evt_001",
        title="Armed clashes in Sudan border region",
        country="Sudan",
        region="East Africa",
        latitude=15.5,
        longitude=32.5,
        casualties=250,
        displaced=15000,
        date=(datetime.now() - timedelta(days=2)).isoformat(),
        description="Ongoing tensions between government forces and armed groups escalate.",
        severity="critical"
    ),
    ConflictEvent(
        id="evt_002",
        title="Shipping disruption in Red Sea",
        country="Yemen",
        region="Middle East",
        latitude=15.0,
        longitude=43.0,
        casualties=0,
        displaced=0,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="Houthi missile attacks continue to disrupt global shipping lanes.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_003",
        title="Border skirmishes reported",
        country="Ukraine",
        region="Europe",
        latitude=49.0,
        longitude=34.0,
        casualties=45,
        displaced=3000,
        date=(datetime.now() - timedelta(days=3)).isoformat(),
        description="Military exchanges along contested border sectors intensify.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_004",
        title="Humanitarian crisis deepens",
        country="Syria",
        region="Middle East",
        latitude=34.5,
        longitude=36.5,
        casualties=150,
        displaced=50000,
        date=(datetime.now() - timedelta(days=5)).isoformat(),
        description="Ongoing civil conflict continues to affect civilian population.",
        severity="critical"
    ),
    ConflictEvent(
        id="evt_005",
        title="Gang violence escalates in urban centre",
        country="Haiti",
        region="Caribbean",
        latitude=18.97,
        longitude=-72.30,
        casualties=35,
        displaced=8000,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="Criminal gang activity disrupts city infrastructure.",
        severity="medium"
    ),
]


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=EventsResponse,
    summary="List conflict events",
    description="Retrieve a paginated list of global conflict events."
)
async def get_events(
    limit: int = Query(20, ge=1, le=100, description="Maximum events to return"),
    offset: int = Query(0, ge=0, description="Number of events to skip")
) -> EventsResponse:
    """
    GET /events/
    -----------
    Query params: limit, offset
    Returns: { "success": true, "data": { "events": [...], "total": N } }
    """
    paginated = MOCK_EVENTS[offset:offset + limit]

    return EventsResponse(
        success=True,
        data={
            "events": [event.dict() for event in paginated],
            "total": len(MOCK_EVENTS),
            "limit": limit,
            "offset": offset
        }
    )


@router.get(
    "/{event_id}",
    response_model=EventsResponse,
    summary="Get a specific conflict event",
    description="Retrieve detailed information about a single conflict event."
)
async def get_event(event_id: str) -> EventsResponse:
    """
    GET /events/{event_id}
    ---------------------
    Returns: { "success": true, "data": { "event": {...} } }
    """
    event = next((e for e in MOCK_EVENTS if e.id == event_id), None)

    if not event:
        return EventsResponse(
            success=False,
            data={"error": f"Event {event_id} not found"}
        )

    return EventsResponse(
        success=True,
        data={"event": event.dict()}
    )


@router.get(
    "/by-region/{region}",
    response_model=EventsResponse,
    summary="Get events by region",
    description="List all conflict events in a specific geographic region."
)
async def get_events_by_region(region: str) -> EventsResponse:
    """
    GET /events/by-region/{region}
    =============================
    Returns: { "success": true, "data": { "events": [...] } }
    """
    region_events = [e for e in MOCK_EVENTS if e.region.lower() == region.lower()]

    return EventsResponse(
        success=True,
        data={
            "events": [event.dict() for event in region_events],
            "region": region,
            "count": len(region_events)
        }
    )
