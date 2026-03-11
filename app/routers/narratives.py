"""
Router: /narratives
Endpoints:
  GET /narratives/   — Extracted narratives (query params: ?event_id=&q=)
  Member C fills the extraction logic.
"""

from fastapi import APIRouter, Query
from typing import Optional

from app.schemas.narratives import NarrativeResponse
from app.services.narrative_service import extract_narratives

router = APIRouter(prefix="/narratives", tags=["Narratives"])


@router.get(
    "/",
    response_model=NarrativeResponse,
    summary="Get extracted narratives",
    description="Retrieve conflict narratives extracted via NLP from the news corpus. "
                "Filter by event ID or free-text query.",
)
async def get_narratives(
    event_id: Optional[str] = Query(None, description="Filter by event ID"),
    q: Optional[str] = Query(None, description="Free-text search within narratives"),
):
    narratives = await extract_narratives(event_id=event_id, query=q)
    return NarrativeResponse(count=len(narratives), narratives=narratives)
