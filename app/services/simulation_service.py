"""
Service layer for scenario simulation.
"""

from uuid import uuid4

from app.schemas.simulate import SimulationOutcome, SimulationResponse


async def run_simulation(
    event_id: str | None = None,
    scenario_description: str = "",
    variables: dict[str, float] | None = None,
    time_horizon_days: int = 30,
) -> SimulationResponse:
    """
    Run a what-if scenario simulation.

    TODO: Integrate with agent-based model or LLM-driven simulation.
    """
    variables = variables or {}
    scenario_id = str(uuid4())

    outcomes = [
        SimulationOutcome(
            step=1,
            description="Initial shock: energy markets react with 8% price spike.",
            severity=6.0 + variables.get("oil_price_shock", 0) * 3,
            probability=0.85,
            affected_regions=["Europe", "Middle East"],
        ),
        SimulationOutcome(
            step=2,
            description="Diplomatic channels activated; UN emergency session called.",
            severity=5.5,
            probability=0.70,
            affected_regions=["Global"],
        ),
        SimulationOutcome(
            step=3,
            description="Humanitarian crisis deepens; refugee flows increase by 40%.",
            severity=7.8,
            probability=0.65,
            affected_regions=["Eastern Europe", "Central Asia"],
        ),
        SimulationOutcome(
            step=4,
            description="Economic sanctions imposed; secondary market effects emerge.",
            severity=6.2,
            probability=0.55,
            affected_regions=["Europe", "North America"],
        ),
    ]

    overall_risk = sum(o.severity * o.probability for o in outcomes) / len(outcomes)

    return SimulationResponse(
        scenario_id=scenario_id,
        scenario_description=scenario_description,
        outcomes=outcomes,
        overall_risk=round(min(10, overall_risk), 2),
        summary=f"Simulation of '{scenario_description}' projects moderate-to-high "
                f"risk (score {round(overall_risk, 1)}/10) over {time_horizon_days} days.",
    )
