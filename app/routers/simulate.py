"""
Router: /simulate
Endpoints:
  POST /simulate/   — Run scenario simulation
"""

from fastapi import APIRouter

from app.schemas.simulate import SimulationScenario, SimulationResponse
from app.services.simulation_service import run_simulation

router = APIRouter(prefix="/simulate", tags=["Simulation"])


@router.post(
    "/",
    response_model=SimulationResponse,
    summary="Run scenario simulation",
    description="Execute a what-if scenario simulation with configurable variables "
                "and time horizon. Returns step-by-step outcomes and overall risk.",
)
async def simulate(payload: SimulationScenario):
    return await run_simulation(
        event_id=payload.event_id,
        scenario_description=payload.scenario_description,
        variables=payload.variables,
        time_horizon_days=payload.time_horizon_days,
    )
