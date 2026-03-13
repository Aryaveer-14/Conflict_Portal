"""
events.py
---------
FastAPI router for global conflict events.

Primary data source: GDELT API (near real-time conflict signals)
Fallback: Static demo events for hackathon reliability

The response shape is preserved for frontend compatibility.
"""

from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
from typing import Optional
import logging

from services.gdelt_service import fetch_conflict_events

logger = logging.getLogger("gcip.events")

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


# ── Static Fallback Events ─────────────────────────────────────────────────────
# Used when GDELT API is unavailable (rate-limited, network issues, etc.)

FALLBACK_EVENTS = [
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
        description="Ongoing tensions between government forces and armed groups escalate near Khartoum.",
        severity="critical"
    ),
    ConflictEvent(
        id="evt_002",
        title="Ukraine conflict escalation",
        country="Ukraine",
        region="Europe",
        latitude=48.38,
        longitude=31.17,
        casualties=120,
        displaced=22000,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="Intensified military operations along the eastern front with heavy artillery exchanges.",
        severity="critical"
    ),
    ConflictEvent(
        id="evt_003",
        title="Israel–Gaza offensive continues",
        country="Palestine",
        region="Middle East",
        latitude=31.42,
        longitude=34.35,
        casualties=480,
        displaced=120000,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="Ongoing military operations in Gaza strip with severe humanitarian impact.",
        severity="critical"
    ),
    ConflictEvent(
        id="evt_004",
        title="Myanmar civil conflict intensifies",
        country="Myanmar",
        region="Southeast Asia",
        latitude=19.76,
        longitude=96.07,
        casualties=95,
        displaced=45000,
        date=(datetime.now() - timedelta(days=3)).isoformat(),
        description="Resistance forces clash with military junta across multiple states.",
        severity="critical"
    ),
    ConflictEvent(
        id="evt_005",
        title="Red Sea shipping disruption",
        country="Yemen",
        region="Middle East",
        latitude=15.55,
        longitude=48.52,
        casualties=0,
        displaced=0,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="Houthi missile and drone attacks continue to disrupt global shipping lanes.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_006",
        title="Eastern DRC armed clashes",
        country="DR Congo",
        region="Central Africa",
        latitude=-1.68,
        longitude=29.22,
        casualties=85,
        displaced=32000,
        date=(datetime.now() - timedelta(days=2)).isoformat(),
        description="M23 rebel advances in North Kivu province trigger civilian displacement.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_007",
        title="Sahel insurgency — Mali operations",
        country="Mali",
        region="West Africa",
        latitude=14.62,
        longitude=-2.10,
        casualties=40,
        displaced=18000,
        date=(datetime.now() - timedelta(days=4)).isoformat(),
        description="Jihadist groups expand operations in northern Mali.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_008",
        title="Ethiopia internal conflict resurgence",
        country="Ethiopia",
        region="East Africa",
        latitude=9.02,
        longitude=38.75,
        casualties=110,
        displaced=28000,
        date=(datetime.now() - timedelta(days=3)).isoformat(),
        description="Renewed clashes in Amhara region between federal forces and Fano militia.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_009",
        title="Nigeria insurgency — Boko Haram resurgence",
        country="Nigeria",
        region="West Africa",
        latitude=11.85,
        longitude=13.16,
        casualties=65,
        displaced=24000,
        date=(datetime.now() - timedelta(days=2)).isoformat(),
        description="ISWAP and Boko Haram factions launch coordinated attacks in Borno State.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_010",
        title="Somalia Al-Shabaab offensive",
        country="Somalia",
        region="East Africa",
        latitude=2.05,
        longitude=45.32,
        casualties=55,
        displaced=15000,
        date=(datetime.now() - timedelta(days=4)).isoformat(),
        description="Al-Shabaab launches attacks on government positions in central Somalia.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_011",
        title="Armenia–Azerbaijan border tensions",
        country="Azerbaijan",
        region="Caucasus",
        latitude=39.90,
        longitude=46.58,
        casualties=12,
        displaced=5000,
        date=(datetime.now() - timedelta(days=5)).isoformat(),
        description="Military build-up along contested Nagorno-Karabakh corridor.",
        severity="high"
    ),
    ConflictEvent(
        id="evt_012",
        title="South China Sea naval confrontation",
        country="Philippines",
        region="Southeast Asia",
        latitude=11.05,
        longitude=117.20,
        casualties=0,
        displaced=0,
        date=(datetime.now() - timedelta(days=2)).isoformat(),
        description="Chinese coast guard vessels confront Philippine resupply missions.",
        severity="medium"
    ),
    ConflictEvent(
        id="evt_013",
        title="Taiwan Strait military incursions",
        country="Taiwan",
        region="East Asia",
        latitude=23.69,
        longitude=120.96,
        casualties=0,
        displaced=0,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="PLA Air Force sorties cross median line. Taiwan scrambles interceptors.",
        severity="medium"
    ),
    ConflictEvent(
        id="evt_014",
        title="Haiti political violence surge",
        country="Haiti",
        region="Caribbean",
        latitude=18.97,
        longitude=-72.30,
        casualties=35,
        displaced=8000,
        date=(datetime.now() - timedelta(days=1)).isoformat(),
        description="Armed gangs seize additional territory in Port-au-Prince.",
        severity="medium"
    ),
    ConflictEvent(
        id="evt_015",
        title="Pakistan border tensions escalate",
        country="Pakistan",
        region="South Asia",
        latitude=33.70,
        longitude=70.15,
        casualties=18,
        displaced=6000,
        date=(datetime.now() - timedelta(days=3)).isoformat(),
        description="Cross-border operations along the Durand Line intensify.",
        severity="medium"
    ),
    ConflictEvent(
        id="evt_016",
        title="Sahel insurgency — Niger destabilization",
        country="Niger",
        region="West Africa",
        latitude=13.51,
        longitude=2.11,
        casualties=22,
        displaced=12000,
        date=(datetime.now() - timedelta(days=6)).isoformat(),
        description="Post-coup instability enables JNIM expansion in western Niger.",
        severity="medium"
    ),
    ConflictEvent(
        id="evt_017",
        title="Syria humanitarian crisis deepens",
        country="Syria",
        region="Middle East",
        latitude=34.80,
        longitude=36.70,
        casualties=150,
        displaced=50000,
        date=(datetime.now() - timedelta(days=5)).isoformat(),
        description="Ongoing civil conflict compounds food insecurity in Idlib.",
        severity="medium"
    ),
    ConflictEvent(
        id="evt_018",
        title="Colombia ELN peace talks stall",
        country="Colombia",
        region="South America",
        latitude=4.71,
        longitude=-74.07,
        casualties=8,
        displaced=3000,
        date=(datetime.now() - timedelta(days=7)).isoformat(),
        description="ELN ceasefire expires amid stalled negotiations.",
        severity="low"
    ),
]


# ── Helper ─────────────────────────────────────────────────────────────────────

def _get_fallback_events(limit: int, offset: int) -> dict:
    """Return static fallback events in the standard response shape."""
    paginated = FALLBACK_EVENTS[offset:offset + limit]
    return {
        "events": [event.dict() for event in paginated],
        "total": len(FALLBACK_EVENTS),
        "limit": limit,
        "offset": offset,
        "source": "static_fallback",
        "timestamp": datetime.utcnow().isoformat(),
    }


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=EventsResponse,
    summary="List conflict events",
    description="Retrieve conflict events from GDELT (live) or static fallback."
)
async def get_events(
    limit: int = Query(20, ge=1, le=100, description="Maximum events to return"),
    offset: int = Query(0, ge=0, description="Number of events to skip")
) -> EventsResponse:
    """
    GET /events/
    -----------
    Primary: Fetches near real-time conflict signals from GDELT API.
    Fallback: Returns static demo events if GDELT is unavailable.

    Response shape is unchanged for frontend compatibility:
    { "success": true, "data": { "events": [...], "total": N } }
    """
    try:
        # Attempt GDELT live data
        gdelt_events = await fetch_conflict_events()

        paginated = gdelt_events[offset:offset + limit]

        return EventsResponse(
            success=True,
            data={
                "events": paginated,
                "total": len(gdelt_events),
                "limit": limit,
                "offset": offset,
                "source": "GDELT",
                "timestamp": datetime.utcnow().isoformat(),
            }
        )

    except Exception as e:
        # Log and fall back to static data
        logger.warning("[Events] GDELT unavailable (%s), using fallback events", str(e))

        return EventsResponse(
            success=True,
            data=_get_fallback_events(limit, offset)
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
    Searches both GDELT cache and fallback events.
    """
    # Try GDELT cached events first
    try:
        gdelt_events = await fetch_conflict_events()
        event = next((e for e in gdelt_events if e["id"] == event_id), None)
        if event:
            return EventsResponse(success=True, data={"event": event})
    except Exception:
        pass

    # Search fallback
    event = next((e for e in FALLBACK_EVENTS if e.id == event_id), None)
    if event:
        return EventsResponse(success=True, data={"event": event.dict()})

    return EventsResponse(
        success=False,
        data={"error": f"Event {event_id} not found"}
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
    Searches GDELT cached events + fallback by region.
    """
    all_events = []

    # Try GDELT
    try:
        gdelt_events = await fetch_conflict_events()
        all_events = [e for e in gdelt_events if e.get("region", "").lower() == region.lower()]
    except Exception:
        pass

    # Supplement with fallback if needed
    if not all_events:
        all_events = [
            e.dict() for e in FALLBACK_EVENTS
            if e.region.lower() == region.lower()
        ]

    return EventsResponse(
        success=True,
        data={
            "events": all_events,
            "region": region,
            "count": len(all_events)
        }
    )
