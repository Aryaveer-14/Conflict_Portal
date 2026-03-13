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
from typing import Any, Dict, Optional, Union

from fastapi import APIRouter
from pydantic import BaseModel, Field

from services.gemini_service import ask_gemini
from services.fallback_service import get_fallback

# ── Router Setup ───────────────────────────────────────────────────────────────
router = APIRouter()


# ── Request Model ──────────────────────────────────────────────────────────────

class AgentQuery(BaseModel):
    """Incoming user question with optional context."""
    query: str = Field(..., min_length=3, description="The user's question (at least 3 characters)")
    context: Union[Dict[str, Any], str, None] = None


# ── System Prompt ──────────────────────────────────────────────────────────────
# This instructs Gemini to behave as a geopolitical intelligence analyst.

SYSTEM_PROMPT = """You are GCIP Intelligence Agent, an expert geopolitical analyst.

When answering:

1. Identify the relevant conflict or region.
2. Provide an executive summary.
3. Provide an IMPACT ASSESSMENT.
4. Separate NARRATIVE vs REALITY.
5. Provide a 30-day FORECAST.

At the end of the response include a confidence level (HIGH, MEDIUM, or LOW) based on data certainty.
Format it exactly as: CONFIDENCE: HIGH (or MEDIUM or LOW)

At the very end include exactly 3 follow-up questions in this exact format:
FOLLOW_UPS:
1. <question>
2. <question>
3. <question>

Tone: analytical, neutral, evidence-based."""

SOURCES = ["conflict_events", "commodity_prices", "news_narratives"]


def _extract_confidence(text: str) -> tuple[str, str]:
    """Extract confidence level from the AI response text and return (cleaned_text, confidence)."""
    match = re.search(r"CONFIDENCE:\s*(HIGH|MEDIUM|LOW)", text, re.IGNORECASE)
    if match:
        confidence = match.group(1).upper()
        cleaned = text[: match.start()].rstrip()
        return cleaned, confidence
    return text, "MEDIUM"


def _extract_follow_ups(text: str) -> tuple[str, list[str]]:
    """Extract follow-up questions from the AI response and return (cleaned_text, follow_ups)."""
    match = re.search(r"FOLLOW_UPS:\s*(.*)$", text, re.IGNORECASE | re.DOTALL)
    if not match:
        return text, []

    section = match.group(1)
    follow_ups = [
        item.strip()
        for item in re.findall(r"(?:^|\n)\s*\d+\.\s*(.+)", section)
        if item.strip()
    ]

    cleaned = text[: match.start()].rstrip()
    return cleaned, follow_ups[:3]


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

    raw_context = body.context if body.context is not None else {}
    if not isinstance(raw_context, dict):
        raw_context = {}

    detail_level = str(raw_context.get("detail_level", "detailed")).strip().lower()
    if detail_level not in ("short", "detailed"):
        detail_level = "detailed"

    response_length_instruction = (
        "Keep the answer concise in 4-6 short bullets."
        if detail_level == "short"
        else "Provide a detailed multi-section analysis."
    )

    # Combine the system prompt with the user's question
    prompt = (
        f"{SYSTEM_PROMPT}\n"
        f"\nResponse length mode: {detail_level.upper()}"
        f"\nLength rule: {response_length_instruction}"
        f"\n\nUser question: {body.query}"
    )

    try:
        # Run the synchronous Gemini call in a thread pool
        # so we don't block the FastAPI event loop
        raw_response = await asyncio.to_thread(ask_gemini, prompt)
        text_without_follow_ups, follow_ups = _extract_follow_ups(raw_response)
        ai_response, confidence = _extract_confidence(text_without_follow_ups)

    except Exception as e:
        # Gemini failed — use the keyword-matched fallback response
        print("Gemini API error:", e)

        fallback = get_fallback(body.query)
        ai_response = fallback["response"]
        confidence = fallback["confidence"]
        follow_ups = fallback.get("follow_ups", [])

    # Return structured JSON response
    return {
        "success": True,
        "data": {
            "response": ai_response,
            "confidence": confidence,
            "sources": SOURCES,
            "follow_ups": follow_ups,
            "detail_level": detail_level,
        },
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "source": "GCIP-Agent",
    }
