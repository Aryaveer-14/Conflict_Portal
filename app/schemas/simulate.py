"""
Pydantic models for scenario simulation.
"""

from pydantic import BaseModel, Field
from typing import Optional


class SimulationScenario(BaseModel):
    event_id: Optional[str] = Field(None, description="Base event to seed the simulation")
    scenario_description: str = Field(..., description="Natural-language scenario to simulate")
    variables: dict[str, float] = Field(
        default_factory=dict,
        description="Tunable params, e.g. {'oil_price_shock': 0.3, 'troop_escalation': 0.7}",
    )
    time_horizon_days: int = Field(30, ge=1, le=365)


class SimulationOutcome(BaseModel):
    step: int
    description: str
    severity: float = Field(..., ge=0, le=10)
    probability: float = Field(..., ge=0, le=1)
    affected_regions: list[str] = Field(default_factory=list)


class SimulationResponse(BaseModel):
    scenario_id: str
    scenario_description: str
    outcomes: list[SimulationOutcome]
    overall_risk: float = Field(..., ge=0, le=10)
    summary: str = ""
