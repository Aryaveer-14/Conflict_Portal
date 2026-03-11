"""
Service layer for fetching conflict events from the GDELT Project API.

Replace the stub implementation with real GDELT GKG / Events API calls
once API access is confirmed.
"""

import httpx
from datetime import datetime, timedelta
from uuid import uuid4

from app.config import get_settings
from app.schemas.events import ConflictEvent


async def fetch_events(
    limit: int = 25,
    offset: int = 0,
    country: str | None = None,
    region: str | None = None,
    start_date: str | None = None,
    end_date: str | None = None,
) -> list[ConflictEvent]:
    """
    Fetch conflict events.

    TODO: Wire up real GDELT API query.
    Currently returns realistic stub data for front-end integration.
    """
    settings = get_settings()

    # ── Stub data for development ────────────────────────
    stubs = [
        ConflictEvent(
            id=str(uuid4()),
            title="Armed conflict escalation in Eastern Region",
            event_date=datetime.utcnow() - timedelta(hours=i * 6),
            source_url="https://gdeltproject.org",
            country=country or "UA",
            region=region or "Eastern Europe",
            latitude=48.3794 + i * 0.1,
            longitude=31.1656 + i * 0.1,
            severity=min(10, 3.0 + i * 0.8),
            goldstein_scale=-5.0 + i * 0.5,
            num_articles=120 - i * 10,
            categories=["armed conflict", "military"],
        )
        for i in range(min(limit, 10))
    ]
    return stubs[offset : offset + limit]


async def fetch_event_by_id(event_id: str) -> ConflictEvent | None:
    """
    Fetch a single event by its unique ID.

    TODO: Query datastore / GDELT by event ID.
    """
    return ConflictEvent(
        id=event_id,
        title="Conflict event detail",
        event_date=datetime.utcnow(),
        source_url="https://gdeltproject.org",
        country="UA",
        region="Eastern Europe",
        latitude=48.3794,
        longitude=31.1656,
        severity=6.5,
        goldstein_scale=-4.0,
        num_articles=85,
        categories=["armed conflict"],
    )
