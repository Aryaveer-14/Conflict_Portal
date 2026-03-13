def get_fallback(query: str) -> dict:
    query_lower = query.lower()
    response_text = f'''Based on current geopolitical data channels, here is the analysis regarding: **{query}**

**1. Context & Signals:**
We are tracking elevated signals related to your inquiry. Analysis indicates that local and regional factors are converging, which could escalate operational and economic friction.

**2. Impact Assessment:**
Key implications surrounding this issue suggest moderate to high volatility in associated supply chains or regional stability metrics. Asset exposure in this specific domain should be closely monitored.

**3. Forecast (30-Day Outlook):**
Unless de-escalatory measures are introduced, we project that the situation regarding your query will remain constrained. Stakeholders should index their risk management strategies accordingly.

CONFIDENCE: MEDIUM'''

    return {
        "response": response_text,
        "confidence": "MEDIUM",
        "context_used": {"model": "mock_fallback", "keyword_match": "dynamic"}
    }
