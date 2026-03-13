"""
agent.py
--------
FastAPI router for the GCIP AI Intelligence Agent endpoint.

Powers the AI Chat feature on the dashboard, where users ask questions
about global conflicts and receive structured intelligence analysis
from the Gemini-backed geopolitical analyst.

Member C — AI/ML Lead and Integration Architect
"""

from datetime import datetime, timezone
import asyncio
import re

from fastapi import APIRouter
from pydantic import BaseModel

from app.services.gemini_service import ask_gemini
from app.services.fallback_service import get_fallback

# ── Router Setup ───────────────────────────────────────────────────────────────
router = APIRouter(prefix="/agent", tags=["Agent AI"])


# ── Request Model ──────────────────────────────────────────────────────────────

class AgentQuery(BaseModel):
    """Incoming user question with optional context."""
    query: str
    context: dict = {}


# ── System Prompt ──────────────────────────────────────────────────────────────
# This instructs Gemini to behave as a geopolitical intelligence analyst.

SYSTEM_PROMPT = """You are GCIP Intelligence Agent, an expert geopolitical analyst.

IMPORTANT: Answer the user's specific question DIRECTLY. Tailor your response perfectly to what the user wants to know. 
Do not force a full report structure (like executive summaries or forecasts) unless explicitly requested.
Keep your tone analytical, neutral, and evidence-based. 

If appropriate, use geopolitical context, impact assessments (like commodities), and data-driven insights to address what the user asked.

At the end of the response include a confidence level (HIGH, MEDIUM, or LOW) based on data certainty.
Format it exactly as: CONFIDENCE: HIGH (or MEDIUM or LOW)"""

SOURCES = ["conflict_events", "commodity_prices", "news_narratives"]


def _extract_confidence(text: str) -> tuple[str, str]:
    """Extract confidence level from the AI response text and return (cleaned_text, confidence)."""
    match = re.search(r"CONFIDENCE:\s*(HIGH|MEDIUM|LOW)", text, re.IGNORECASE)
    if match:
        confidence = match.group(1).upper()
        cleaned = text[: match.start()].rstrip()
        return cleaned, confidence
    return text, "MEDIUM"


# ── Endpoint: POST /agent ──────────────────────────────────────────────────────

@router.post(
    "/",
    summary="Query the GCIP Intelligence Agent",
    description=(
        "Send a natural-language question about global conflicts to the "
        "Gemini-powered intelligence agent. Returns a structured analysis "
        "with executive summary, impact assessment, and 30-day forecast."
    ),
)
async def query_agent(body: AgentQuery) -> dict:
    """
    POST /agent
    -----------
    Body:   { "query": "...", "context": {} }
    Returns:
        {
            "success": true,
            "data": { "response": "AI generated analysis text" },
            "timestamp": "ISO timestamp",
            "source": "GCIP-Agent"
        }
    """

    # Combine the system prompt with the user's question
    prompt = f"{SYSTEM_PROMPT}\n\nUser question: {body.query}"

    try:
        # Run the synchronous Gemini call in a thread pool
        # so we don't block the FastAPI event loop
        raw_response = await asyncio.to_thread(ask_gemini, prompt)
        ai_response, confidence = _extract_confidence(raw_response)
        context_used = {"model": "gemini"}

    except Exception as e:
        # Gemini failed — use the keyword-matched fallback response
        print("Gemini API error:", e)

        fallback = get_fallback(body.query)
        ai_response = fallback["response"]
        confidence = fallback["confidence"]
        context_used = fallback["context_used"]

    # Return structured JSON response
    return {
        "success": True,
        "data": {
            "response": ai_response,
            "confidence": confidence,
            "sources": SOURCES,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "GCIP-Agent",
    }
