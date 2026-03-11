"""
Service layer for narrative extraction.
Member C fills the real extraction / NLP logic.
"""

from datetime import datetime
from uuid import uuid4

from app.schemas.narratives import Narrative


async def extract_narratives(
    event_id: str | None = None,
    query: str | None = None,
) -> list[Narrative]:
    """
    Extract conflict narratives from news corpus.

    TODO (Member C): Implement NLP-based narrative extraction.
    """
    return [
        Narrative(
            id=str(uuid4()),
            event_id=event_id,
            title="Escalation narrative detected",
            summary="Multiple sources describe a pattern of military build-up "
                    "along the border region, with humanitarian concerns rising.",
            key_actors=["Government Forces", "Opposition Groups", "UN Observers"],
            themes=["military escalation", "humanitarian crisis", "border security"],
            sentiment=-0.6,
            confidence=0.78,
            created_at=datetime.utcnow(),
        )
    ]
