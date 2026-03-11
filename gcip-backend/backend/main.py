"""
Conflict Portal — GCIP Backend Entry Point

Run with:  python -m uvicorn backend.main:app --reload
From:      gcip-backend/
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from dotenv import load_dotenv

# Load .env before anything else
load_dotenv()

# ── Import routers ───────────────────────────────────────
from backend.routers import events, narratives, impact, forecast, simulate, commodities, news

app = FastAPI(
    title="GCIP — Global Conflict Intelligence Platform",
    description=(
        "Real-time conflict intelligence API: GDELT/ACLED event ingestion, "
        "commodity tracking, narrative extraction, cascade impact analysis, "
        "30-day forecasting, and scenario simulation."
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
app.include_router(events.router, prefix="/events", tags=["Events"])
app.include_router(narratives.router, prefix="/narratives", tags=["Narratives"])
app.include_router(impact.router, prefix="/impact", tags=["Impact"])
app.include_router(forecast.router, prefix="/forecast", tags=["Forecast"])
app.include_router(simulate.router, prefix="/simulate", tags=["Simulation"])
app.include_router(commodities.router, prefix="/commodities", tags=["Commodities"])
app.include_router(news.router, prefix="/news", tags=["News"])


# ── Health check ─────────────────────────────────────────
@app.get("/health", tags=["System"], summary="Health check")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "version": app.version,
    }
