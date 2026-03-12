"""
narratives.py
--------------
FastAPI router for extracting dominant conflict narratives using Google Gemini.

This module is part of the GCIP AI/ML layer (Member C — AI/ML Lead).
It receives a conflict event identifier and query, generates contextual
mock headlines, passes them through the Gemini-powered narrative extraction
service, and returns structured narrative insights to the frontend dashboard.

Endpoint:
    GET /narratives?event_id=sudan&q=sudan+conflict

Flow:
    1. Frontend calls GET /narratives with event_id and optional query
    2. Router builds mock headlines contextualised to the query
    3. Headlines are sent to extract_narratives() (Gemini AI)
    4. Structured narrative objects are returned to the caller
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Query
from services.narrative_service import extract_narratives

# ── Router Setup ───────────────────────────────────────────────────────────────
# No prefix here — main.py registers this with prefix="/api"
router = APIRouter()


# ── Helper: Generate contextual mock headlines ─────────────────────────────────

def _build_mock_headlines(query: str) -> list[str]:
    """
    Build a list of realistic mock news headlines based on the conflict query.

    In production this would pull from a live news API (e.g. GDELT, NewsAPI).
    For the hackathon, we generate contextually relevant headlines so the
    Gemini narrative extraction has meaningful input to work with.
    """
    return [
        f"Oil prices rise as {query} conflict escalates",
        f"Shipping companies reroute vessels amid {query} tensions",
        f"Global trade fears grow over {query} instability",
        f"Humanitarian agencies warn of displacement crisis in {query} region",
        f"International community calls for ceasefire in {query}",
        f"Defense spending surges in response to {query} developments",
        f"Commodity markets react to escalating {query} situation",
    ]


# ── Endpoint: GET /narratives ─────────────────────────────────────────────────

@router.get(
    "/",
    summary="Extract dominant narratives for a conflict event",
    description=(
        "Analyse AI-generated headlines for a conflict event and return "
        "the dominant narratives shaping public perception. Powered by "
        "Google Gemini via the narrative extraction service."
    ),
)
async def get_narratives(
    event_id: str = Query(
        ...,
        description="Unique identifier for the conflict event (e.g. 'sudan', 'evt_001')",
        example="sudan",
    ),
    q: str = Query(
        default="conflict",
        description="Search query describing the conflict for headline generation",
        example="sudan conflict",
    ),
) -> dict:
    """
    GET /narratives?event_id=sudan&q=sudan+conflict
    ------------------------------------------------
    Generates contextual headlines from the query, passes them through
    the Gemini narrative extraction pipeline, and returns structured
    narrative insights.

    Returns an empty narratives list (never an error) if the AI service
    is unavailable, ensuring the frontend always gets a valid response.
    """

    # Step 1: Build mock headlines contextualised to the query
    headlines = _build_mock_headlines(q)

    # Step 2: Pass headlines to the Gemini-powered narrative extractor.
    #         extract_narratives() is async and returns [] on any internal
    #         failure, so the endpoint is resilient to AI service outages.
    try:
        narratives = await extract_narratives(headlines)
    except Exception:
        # Safety net — if something unexpected propagates, return empty list
        narratives = []

    # Step 3: Build and return the structured response
    return {
        "success": True,
        "data": {
            "event_id": event_id,
            "narratives": narratives,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "Gemini-Narratives",
    }
