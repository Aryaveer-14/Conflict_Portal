"""
Conflict Portal — FastAPI Application Entry Point

Registers all routers and provides the /health endpoint.
Run with: uvicorn app.main:app --reload
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from app.config import get_settings

# ── Import routers ───────────────────────────────────────
from app.routers import (
    events,
    commodities,
    news,
    narratives,
    impact,
    forecast,
    simulate,
    agent,
)

settings = get_settings()

app = FastAPI(
    title="Conflict Portal API",
    description=(
        "Real-time conflict intelligence platform providing GDELT event data, "
        "commodity price tracking, narrative extraction, cascade impact analysis, "
        "30-day forecasting, scenario simulation, and agentic AI queries."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Register routers ────────────────────────────────────
app.include_router(events.router)
app.include_router(commodities.router)
app.include_router(news.router)
app.include_router(narratives.router)
app.include_router(impact.router)
app.include_router(forecast.router)
app.include_router(simulate.router)
app.include_router(agent.router)


# ── Health check ─────────────────────────────────────────
@app.get(
    "/health",
    tags=["System"],
    summary="Health check",
    description="Returns server status and uptime info.",
)
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version,
    }
