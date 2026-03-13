"""
gemini_service.py
-----------------
Core service for interacting with the Google Gemini AI API.
Handles authentication via environment variable and exposes
a simple ask_gemini() function for use across the backend.
"""

import os
import time
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ── Configuration ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise EnvironmentError(
        "GEMINI_API_KEY is not set. "
        "Please add it to your .env file or environment variables."
    )

# Configure the Gemini SDK with the API key
genai.configure(api_key=GEMINI_API_KEY)

# ── Model Setup ────────────────────────────────────────────────────────────────
# Model fallback chain — tries each until one works
MODEL_CHAIN = ["gemini-2.0-flash-lite", "gemini-2.0-flash", "gemini-2.5-flash"]

# Optional: tweak generation parameters here
GENERATION_CONFIG = {
    "temperature": 0.7,        # Balanced creativity vs. determinism
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 2048,
}

# ── Core Function ──────────────────────────────────────────────────────────────

def ask_gemini(prompt: str) -> str:
    """
    Send a prompt to Gemini and return the response text.
    Tries multiple models and retries on rate limits.

    Args:
        prompt (str): The user/system prompt to send.

    Returns:
        str: The generated text response from Gemini.

    Raises:
        RuntimeError: If all models and retries fail.
    """
    last_error = None

    for model_name in MODEL_CHAIN:
        try:
            model = genai.GenerativeModel(
                model_name=model_name,
                generation_config=GENERATION_CONFIG,
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            last_error = e
            error_str = str(e)
            # On rate limit, try the next model immediately
            if "429" in error_str or "quota" in error_str.lower():
                continue
            # Other errors: also try next model
            continue

    raise RuntimeError(f"Gemini API error: {str(last_error)}") from last_error
