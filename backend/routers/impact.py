"""
impact.py
---------
FastAPI router for AI-generated socioeconomic impact analysis.
Uses Gemini API to analyse conflict events and their global impacts.
"""

import asyncio
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from services.gemini_service import ask_gemini

router = APIRouter(prefix="/impact", tags=["Impact Analysis"])


# ── Request / Response Schemas ─────────────────────────────────────────────────

class ImpactRequest(BaseModel):
    """Request for impact analysis."""
    event_id: str = Field(..., description="ID of the conflict event")
    event_data: dict = Field(..., description="Structured event data to analyse")
    include_commodities: bool = Field(
        default=True,
        description="Include commodity price impact in analysis"
    )


class ImpactSection(BaseModel):
    """A section of the impact analysis."""
    title: str
    content: str


class ImpactAnalysis(BaseModel):
    """Complete AI-generated impact analysis."""
    event_id: str
    success: bool
    sections: list[dict] = Field(..., description="Analysis sections")


# ── System Prompt ──────────────────────────────────────────────────────────────

IMPACT_ANALYSIS_SYSTEM_PROMPT = """
You are an expert geopolitical economist specialising in quantifying the global 
socioeconomic impacts of armed conflicts. Your task is to provide comprehensive
impact assessments covering:

1. **Executive Summary** — Key impacts in 2–3 bullet points
2. **Immediate Impact** — Short-term (weeks) effects on trade, supply chains, markets
3. **Commodity Price Impact** — Expected changes to energy, food, minerals
4. **Humanitarian Cost** — Displacement, casualties, healthcare disruption
5. **Macroeconomic Effects** — Inflation, currency volatility, growth implications
6. **Strategic/Geopolitical Impact** — Power balance shifts, alliance implications
7. **Forecast** — Medium-term outlook (3–6 months) and recovery potential

Be specific with numbers where possible, reference actual impacts, and maintain 
an evidence-based, neutral analytical tone.
"""


# ── Endpoints ──────────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=dict,  # Flexible response structure
    summary="Request socioeconomic impact analysis",
    description=(
        "Generate a Gemini-powered analysis of a conflict event's global "
        "socioeconomic impacts."
    )
)
async def request_impact_analysis(request: ImpactRequest) -> dict:
    """
    POST /impact/
    -----------
    Body: {
      "event_id": "evt_123",
      "event_data": { "title": "...", "country": "...", "casualties": ... },
      "include_commodities": true
    }
    Returns: { "success": true, "analysis": {...} }
    """
    # Build prompt from event data
    prompt_parts = [IMPACT_ANALYSIS_SYSTEM_PROMPT.strip()]

    # Add event details
    event_title = request.event_data.get("title", "Unknown event")
    event_country = request.event_data.get("country", "Unknown country")
    event_description = request.event_data.get("description", "No description provided")
    casualties = request.event_data.get("casualties", 0)
    displaced = request.event_data.get("displaced", 0)

    event_context = f"""
CONFLICT EVENT DETAILS:
- Title: {event_title}
- Country: {event_country}
- Description: {event_description}
- Estimated casualties: {casualties}
- Internally displaced persons: {displaced}

Please provide a comprehensive impact analysis for this event, following the 
structure outlined above.
"""

    prompt_parts.append(event_context)

    if request.include_commodities:
        commodity_note = """
Additionally, analyse the likely impact on global commodity markets:
energy (oil/gas), food (grains/wheat), and precious metals. Quantify 
expected price movements where possible.
"""
        prompt_parts.append(commodity_note)

    full_prompt = "\n\n".join(prompt_parts)

    try:
        # Run the blocking Gemini call in a thread pool
        analysis_text = await asyncio.to_thread(ask_gemini, full_prompt)
    except RuntimeError:
        # Gemini unavailable — return placeholder analysis
        return {
            "success": False,
            "data": {
                "event_id": request.event_id,
                "analysis_text": "AI analysis service is temporarily unavailable due to rate limits.",
                "sections": [{"title": "Service Unavailable", "content": "Please try again later."}],
                "disclaimer": "AI service rate-limited. Showing placeholder data."
            }
        }

    # Parse analysis text into structured sections
    sections = _parse_analysis_sections(analysis_text)

    return {
        "success": True,
        "data": {
            "event_id": request.event_id,
            "analysis_text": analysis_text,
            "sections": sections,
            "disclaimer": (
                "This analysis is AI-generated and should be supplemented with "
                "expert human review before informing decision-making."
            )
        }
    }


# ── Helper Functions ───────────────────────────────────────────────────────────

def _parse_analysis_sections(text: str) -> list[dict]:
    """
    Parse the AI-generated analysis text into structured sections.
    
    Looks for common section headers like "## Section Title" or 
    "1. Section Title" and groups text accordingly.
    
    Falls back to returning the full text as a single section if parsing fails.
    """
    import re

    # Define expected section titles
    expected_sections = [
        "Executive Summary",
        "Immediate Impact",
        "Commodity Price Impact",
        "Humanitarian Cost",
        "Macroeconomic Effects",
        "Strategic Geopolitical Impact",
        "Forecast"
    ]

    sections = []

    # Try to split by markdown headers (## Section)
    header_pattern = r"(?:##\s*)?([^:]+):\s*(.+?)(?=(?:##\s*)?[^:]+:|$)"
    matches = re.findall(header_pattern, text, re.DOTALL | re.IGNORECASE)

    if matches:
        for title, content in matches:
            sections.append({
                "title": title.strip(),
                "content": content.strip()
            })
    else:
        # Fallback: return entire text as a single section
        sections.append({
            "title": "Impact Analysis",
            "content": text.strip()
        })

    return sections


@router.get(
    "/event/{event_id}",
    summary="Get cached impact analysis for an event",
    description="Retrieve a previously generated impact analysis."
)
async def get_cached_impact(event_id: str) -> dict:
    """
    GET /impact/event/{event_id}
    --------------------------
    Returns: { "success": true, "data": { "analysis": {...} } }
    
    Placeholder — in production would query a cache/database layer.
    """
    placeholder_analysis = {
        "executive_summary": [
            "Immediate disruption to Red Sea shipping affecting Europe-Asia trade",
            "Oil prices expected to rise 5–10% within 2 weeks",
            "Humanitarian crisis with 50,000+ displacement expected"
        ],
        "macroeconomic_impact": "Global inflation pressure; additional 0.3–0.5% growth headwind",
        "commodity_impacts": {
            "oil": "+8–12%",
            "shipping_costs": "+15–20%",
            "insurance": "+25–30%"
        },
        "forecast": "Escalation risk; supply chain disruption likely to persist 3–6 months"
    }

    return {
        "success": True,
        "data": {
            "event_id": event_id,
            "analysis": placeholder_analysis,
            "cached": False,
            "note": "Placeholder — generate fresh analysis via POST /impact/"
        }
    }
