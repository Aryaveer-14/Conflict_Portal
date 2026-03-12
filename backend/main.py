"""
main.py
-------
FastAPI application entry point for the GCIP backend.
Registers all routers, configures CORS, and exposes a health check.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import agent
from routers import narratives
from routers.events import router as events_router
from routers.commodities import router as commodities_router
from routers.impact import router as impact_router

# ── App Initialisation ─────────────────────────────────────────────────────────

app = FastAPI(
    title="Global Conflict Impact Intelligence Platform (GCIP)",
    description=(
        "AI-powered backend for analysing global conflicts, "
        "extracting narratives, and answering geopolitical queries."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ────────────────────────────────────────────────────────────
# Allow requests from the React dev server and production domain
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # Alternative React port
    "http://frontend:5173",    # Docker internal network
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router Registration ────────────────────────────────────────────────────────
app.include_router(agent.router, prefix="/agent", tags=["Agent"])
app.include_router(narratives.router, prefix="/narratives", tags=["Narratives"])
app.include_router(events_router, prefix="/api")
app.include_router(commodities_router, prefix="/api")
app.include_router(impact_router, prefix="/api")

# ── Health Check ───────────────────────────────────────────────────────────────

@app.get("/health", tags=["Health"])
async def health_check():
    """Simple liveness probe used by Docker and load balancers."""
    return {"status": "ok", "service": "GCIP Backend"}


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to GCIP API",
        "docs": "/docs",
        "health": "/health",
    }
