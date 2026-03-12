"""
fallback_service.py
-------------------
Pre-generated AI analysis responses used when the Gemini API is unavailable.

Ensures the GCIP dashboard always returns intelligent, contextual responses
even during network issues, API rate limits, or timeouts — critical for
a live hackathon demo.

Member C — AI/ML Lead and Integration Architect
"""


# ── Pre-Generated Fallback Responses ───────────────────────────────────────────
# Each category contains a multi-paragraph geopolitical analysis that mirrors
# the structure Gemini would normally produce (executive summary, impact
# assessment, narrative vs reality, and 30-day forecast).

FALLBACK_RESPONSES = {
    "oil": {
        "response": (
            "## Conflict Region: Middle East / Red Sea Corridor\n\n"
            "### Executive Summary\n"
            "Ongoing hostilities in the Red Sea region have created significant disruption "
            "to global energy supply chains. Houthi attacks on commercial shipping through "
            "the Bab al-Mandeb Strait have forced major tanker operators to reroute around "
            "the Cape of Good Hope, adding 10–14 days to transit times and increasing "
            "shipping costs by an estimated 25–40%.\n\n"
            "### Impact Assessment\n"
            "- **Oil prices**: Brent crude has seen upward pressure of 8–12%, with spot "
            "prices for Middle East grades trading at a premium.\n"
            "- **Refining margins**: European refineries face higher feedstock costs due "
            "to longer shipping routes and increased insurance premiums.\n"
            "- **LNG markets**: Liquefied natural gas shipments to Europe and Asia are "
            "experiencing delays, tightening winter supply buffers.\n"
            "- **Strategic reserves**: Several nations have signalled readiness to release "
            "strategic petroleum reserves if disruptions persist beyond 60 days.\n\n"
            "### Narrative vs Reality\n"
            "- **Narrative**: 'Oil supply crisis threatens global economy.'\n"
            "- **Reality**: While prices have risen, global spare capacity (primarily Saudi "
            "Arabia and UAE) provides a buffer. The primary impact is on logistics costs "
            "rather than actual supply volume. However, prolonged disruption could erode "
            "this buffer significantly.\n\n"
            "### 30-Day Forecast\n"
            "Expect continued price volatility in the $80–95/barrel range. Diplomatic "
            "initiatives are unlikely to resolve the underlying conflict within this "
            "timeframe. Shipping reroutes will remain the norm, sustaining elevated "
            "freight and insurance costs."
        ),
        "confidence": "HIGH",
        "context_used": {"fallback": True},
    },
    "trade": {
        "response": (
            "## Conflict Region: Global Maritime Trade Routes\n\n"
            "### Executive Summary\n"
            "Escalating conflicts near critical maritime chokepoints — including the Red "
            "Sea, Strait of Hormuz, and Black Sea — are disrupting global trade flows. "
            "Approximately 12–15% of global trade normally transits the Suez Canal, and "
            "current diversions are creating cascading delays across supply chains.\n\n"
            "### Impact Assessment\n"
            "- **Container shipping**: Freight rates on Asia–Europe routes have surged "
            "150–200% from pre-crisis levels, with capacity constraints emerging.\n"
            "- **Food security**: Grain shipments from the Black Sea region face continued "
            "uncertainty, affecting North Africa and the Middle East.\n"
            "- **Manufacturing**: Just-in-time supply chains in automotive and electronics "
            "sectors are experiencing 2–3 week delays on component deliveries.\n"
            "- **Insurance**: War risk premiums for Red Sea transit have increased "
            "tenfold, making rerouting economically preferable for most carriers.\n\n"
            "### Narrative vs Reality\n"
            "- **Narrative**: 'Global trade is collapsing under conflict pressure.'\n"
            "- **Reality**: Trade volumes remain resilient — goods are still moving, but "
            "via longer routes at higher cost. The impact is inflationary rather than "
            "recessionary. Small and medium importers in developing nations bear the "
            "heaviest burden due to limited negotiating power on freight contracts.\n\n"
            "### 30-Day Forecast\n"
            "Shipping disruptions will persist. Container rates are expected to stabilise "
            "at elevated levels. Governments may intervene with port subsidies or "
            "temporary tariff relief for essential goods. No significant de-escalation "
            "of the underlying conflicts is anticipated within this window."
        ),
        "confidence": "MEDIUM",
        "context_used": {"fallback": True},
    },
    "default": {
        "response": (
            "## Geopolitical Impact Analysis\n\n"
            "### Executive Summary\n"
            "The current global conflict landscape is characterised by multiple "
            "simultaneous crises across several regions — including ongoing hostilities "
            "in Sudan, Ukraine, Yemen, and Syria. These conflicts are creating compound "
            "effects on global security, economics, and humanitarian conditions.\n\n"
            "### Impact Assessment\n"
            "- **Humanitarian**: Over 110 million people are currently forcibly displaced "
            "worldwide, the highest figure on record. Funding gaps for humanitarian "
            "operations exceed 60% in most major crises.\n"
            "- **Economic**: Conflict-driven supply chain disruptions contribute an "
            "estimated 0.3–0.5 percentage points to global inflation.\n"
            "- **Security**: Regional conflicts risk escalation through proxy involvement "
            "of major powers, particularly in the Middle East and Eastern Europe.\n"
            "- **Energy & commodities**: Multiple conflicts near energy infrastructure "
            "maintain upward pressure on oil, gas, and grain prices.\n\n"
            "### Narrative vs Reality\n"
            "- **Narrative**: 'The world is more dangerous than ever.'\n"
            "- **Reality**: While the number of active conflicts is historically high, "
            "international mechanisms for containment continue to function. The primary "
            "risk is not any single conflict but the cumulative strain on diplomatic, "
            "humanitarian, and economic resources across simultaneous crises.\n\n"
            "### 30-Day Forecast\n"
            "No major de-escalation expected across active conflict zones. Diplomatic "
            "efforts will focus on localised ceasefires rather than comprehensive peace "
            "agreements. Commodity price volatility will continue. Humanitarian funding "
            "appeals for 2026 are likely to set new records."
        ),
        "confidence": "MEDIUM",
        "context_used": {"fallback": True},
    },
}


# ── Fallback Function ──────────────────────────────────────────────────────────

def get_fallback(query: str) -> dict:
    """
    Return a pre-generated analysis response based on keyword matching.

    Examines the user's query for domain-specific keywords and returns
    the most relevant fallback category:
      - "oil"     → energy/fuel-related conflicts
      - "trade"   → shipping/supply chain disruptions
      - "default" → general geopolitical analysis

    Args:
        query: The user's original question string.

    Returns:
        dict with "response" (str) and "context_used" (dict) keys.
    """
    q = query.lower()

    # Match energy-related queries
    if any(keyword in q for keyword in ("oil", "energy", "fuel", "petroleum", "gas")):
        return FALLBACK_RESPONSES["oil"]

    # Match trade/shipping-related queries
    if any(keyword in q for keyword in ("trade", "shipping", "supply", "freight", "export")):
        return FALLBACK_RESPONSES["trade"]

    # Default: general geopolitical analysis
    return FALLBACK_RESPONSES["default"]
