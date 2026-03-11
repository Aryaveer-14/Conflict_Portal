"""
Router: /impact
Endpoints:
  POST /impact/    — Compute cascade impact scores for an event
"""

from fastapi import APIRouter

from app.schemas.impact import ImpactRequest, ImpactResponse
from app.services.impact_service import compute_impact

router = APIRouter(prefix="/impact", tags=["Impact Analysis"])


@router.post(
    "/",
    response_model=ImpactResponse,
    summary="Cascade impact analysis",
    description="Compute multi-dimensional cascade impact scores for a given "
                "conflict event, including economic, humanitarian, political, "
                "and environmental dimensions.",
)
async def analyse_impact(payload: ImpactRequest):
    return await compute_impact(
        event_id=payload.event_id,
        region=payload.region,
        include_economic=payload.include_economic,
        include_humanitarian=payload.include_humanitarian,
    )
