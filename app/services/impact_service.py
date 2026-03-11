"""
Service layer for cascade impact scoring.
"""

from app.schemas.impact import ImpactDimension, ImpactResponse


async def compute_impact(
    event_id: str,
    region: str | None = None,
    include_economic: bool = True,
    include_humanitarian: bool = True,
) -> ImpactResponse:
    """
    Compute cascade impact scores for a given conflict event.

    TODO: Integrate real impact-modelling pipeline.
    """
    dimensions: list[ImpactDimension] = []

    if include_economic:
        dimensions.append(
            ImpactDimension(
                dimension="economic",
                score=7.2,
                confidence=0.85,
                description="Significant disruption to energy supply chains; "
                            "oil prices expected to spike 8-12%.",
                affected_countries=["DE", "PL", "FR"],
            )
        )

    if include_humanitarian:
        dimensions.append(
            ImpactDimension(
                dimension="humanitarian",
                score=8.5,
                confidence=0.90,
                description="Estimated 50k displaced civilians; urgent need for "
                            "medical supplies and shelter.",
                affected_countries=["UA", "PL", "MD"],
            )
        )

    dimensions.append(
        ImpactDimension(
            dimension="political",
            score=6.8,
            confidence=0.72,
            description="NATO alliance tensions rising; emergency summit anticipated.",
            affected_countries=["US", "UK", "DE", "FR"],
        )
    )

    overall = sum(d.score for d in dimensions) / len(dimensions) if dimensions else 0

    risk_level = (
        "critical" if overall >= 8
        else "high" if overall >= 6
        else "medium" if overall >= 4
        else "low"
    )

    return ImpactResponse(
        event_id=event_id,
        overall_score=round(overall, 2),
        risk_level=risk_level,
        dimensions=dimensions,
        cascade_chain=[
            "Energy supply disruption",
            "Commodity price spike",
            "Inflation pressure on EU",
            "Humanitarian corridor strain",
            "Diplomatic escalation",
        ],
    )
