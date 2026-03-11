"""
Router: /agent
Endpoints:
  POST /agent/   — Agentic AI query with context
  Member C owns the implementation.
"""

from fastapi import APIRouter

from app.schemas.agent import AgentQuery, AgentResponse
from app.services.agent_service import process_agent_query

router = APIRouter(prefix="/agent", tags=["Agent AI"])


@router.post(
    "/",
    response_model=AgentResponse,
    summary="Agentic AI query",
    description="Submit a natural-language question with optional context. "
                "The AI agent analyses conflict data and returns a structured "
                "answer with sources and follow-up suggestions.",
)
async def query_agent(payload: AgentQuery):
    return await process_agent_query(
        query=payload.query,
        context=payload.context,
        conversation_id=payload.conversation_id,
    )
