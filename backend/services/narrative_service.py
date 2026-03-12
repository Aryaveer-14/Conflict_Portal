"""
narrative_service.py
--------------------
Converts raw news headlines about geopolitical conflicts into structured
narrative insights using the Google Gemini API.

This service is part of the GCIP AI/ML layer (Member C).
It sits between the FastAPI router and the Gemini model, handling:
  - Prompt construction
  - Gemini API interaction
  - JSON parsing and sanitisation
  - Safe error handling (never crashes the caller)
"""

import os
import json
import re
import logging

import google.generativeai as genai
from dotenv import load_dotenv

# ── Logging ────────────────────────────────────────────────────────────────────
logger = logging.getLogger(__name__)

# ── Environment Setup ──────────────────────────────────────────────────────────
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise EnvironmentError(
        "GEMINI_API_KEY is not set. "
        "Add it to backend/.env before starting the server."
    )

# Configure the Gemini SDK once at module load time
genai.configure(api_key=GEMINI_API_KEY)

# ── Model Initialisation ───────────────────────────────────────────────────────
MODEL_CHAIN = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]

GENERATION_CONFIG = {
    "temperature": 0.4,      # Lower = more deterministic JSON output
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
}

def _get_model(model_name: str):
    return genai.GenerativeModel(
        model_name=model_name,
        generation_config=GENERATION_CONFIG,
    )

# ── Prompt Template ────────────────────────────────────────────────────────────

def _build_prompt(headlines: list[str]) -> str:
    """
    Construct the full prompt sent to Gemini.

    Combines all headlines into a numbered list, then instructs the model
    to return ONLY a valid JSON object with the narrative structure.
    """
    numbered_headlines = "\n".join(
        f"{i + 1}. {headline}" for i, headline in enumerate(headlines)
    )

    return f"""You are a geopolitical narrative analyst.

Given the following news headlines about a conflict, identify the dominant narratives shaping public perception.

Return ONLY valid JSON in this structure:

{{
  "narratives": [
    {{
      "label": "short narrative label",
      "description": "1-2 sentence explanation",
      "prevalence_score": 0-100
    }}
  ]
}}

Extract 3 to 6 narratives ranked by prevalence_score.

NEWS HEADLINES:
{numbered_headlines}"""


# ── JSON Sanitiser ─────────────────────────────────────────────────────────────

def _parse_gemini_json(raw_text: str) -> dict:
    """
    Safely extract and parse a JSON object from Gemini's raw response text.

    Handles cases where Gemini wraps the JSON in markdown code fences
    (e.g. ```json ... ```) despite being told not to.

    Args:
        raw_text (str): Raw text returned by Gemini.

    Returns:
        dict: Parsed JSON object.

    Raises:
        ValueError: If no valid JSON object can be extracted.
    """
    # Strip markdown code fences: ```json ... ``` or ``` ... ```
    cleaned = re.sub(r"```(?:json)?", "", raw_text, flags=re.IGNORECASE).replace("```", "")
    cleaned = cleaned.strip()

    # Attempt direct parse first
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Fallback: extract the first {...} block using regex
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            # JSON may be truncated — try to repair by closing open brackets
            partial = match.group().rstrip().rstrip(",")
            # Close any unclosed arrays and objects
            open_braces = partial.count("{") - partial.count("}")
            open_brackets = partial.count("[") - partial.count("]")
            repaired = partial + "]" * open_brackets + "}" * open_braces
            try:
                return json.loads(repaired)
            except json.JSONDecodeError:
                pass

    raise ValueError(f"Could not extract valid JSON from Gemini response:\n{raw_text[:400]}")


# ── Core Function ──────────────────────────────────────────────────────────────

async def extract_narratives(news_headlines: list[str]) -> list:
    """
    Analyse a list of news headlines and return dominant conflict narratives.

    Sends headlines to the Gemini 1.5 Flash model, parses the structured
    JSON response, and returns the narratives list.

    On any failure (API error, parse error, invalid structure), logs the
    error and returns an empty list so the caller is never broken.

    Args:
        news_headlines (list[str]): Raw news headline strings.

    Returns:
        list: A list of narrative dicts:
              [
                {
                  "label": str,
                  "description": str,
                  "prevalence_score": int  # 0–100
                },
                ...
              ]
              Returns [] on any error.

    Example:
        >>> headlines = [
        ...     "Oil prices surge after Red Sea attacks",
        ...     "Shipping companies reroute vessels around Africa",
        ...     "Global trade disruption fears grow",
        ... ]
        >>> narratives = await extract_narratives(headlines)
        >>> narratives[0]["label"]
        'Oil supply crisis fear'
    """
    # Guard: return early if no headlines provided
    if not news_headlines:
        logger.warning("extract_narratives called with empty headlines list.")
        return []

    prompt = _build_prompt(news_headlines)

    # ── Call Gemini (with model fallback) ─────────────────────────────────────
    raw_text = None
    for model_name in MODEL_CHAIN:
        try:
            m = _get_model(model_name)
            response = m.generate_content(prompt)
            raw_text = response.text
            logger.debug("Gemini (%s) raw response: %s", model_name, raw_text[:300])
            break
        except Exception as exc:
            logger.warning("Gemini model %s failed: %s", model_name, exc)
            continue

    if raw_text is None:
        logger.error("All Gemini models failed for narrative extraction.")
        return []

    # ── Parse Response ─────────────────────────────────────────────────────────
    try:
        parsed = _parse_gemini_json(raw_text)
    except (ValueError, json.JSONDecodeError) as exc:
        logger.error("Failed to parse Gemini JSON response: %s", exc)
        return []

    # ── Validate Structure ─────────────────────────────────────────────────────
    narratives = parsed.get("narratives")

    if not isinstance(narratives, list):
        logger.error(
            "Unexpected response structure — 'narratives' key missing or not a list. "
            "Parsed: %s", parsed
        )
        return []

    # ── Normalise Each Narrative ───────────────────────────────────────────────
    sanitised = []
    for item in narratives:
        try:
            sanitised.append({
                "label":            str(item.get("label", "Unknown")),
                "description":      str(item.get("description", "")),
                # Clamp prevalence_score to valid range [0, 100]
                "prevalence_score": max(0, min(100, int(item.get("prevalence_score", 0)))),
            })
        except (TypeError, ValueError) as exc:
            logger.warning("Skipping malformed narrative entry %s: %s", item, exc)
            continue

    # Sort by prevalence_score descending (highest first)
    sanitised.sort(key=lambda n: n["prevalence_score"], reverse=True)

    logger.info("Extracted %d narratives from %d headlines.", len(sanitised), len(news_headlines))
    return sanitised
