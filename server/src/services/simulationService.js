/**
 * services/simulationService.js
 * -----------------------------
 * Service layer for scenario simulation.
 * Port of simulation_service.py — same stub outcomes.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Run a what-if scenario simulation.
 * TODO: Integrate LLM-driven simulation.
 */
export async function runSimulation({
  event_id = null,
  scenario_description = '',
  variables = {},
  time_horizon_days = 30,
} = {}) {
  const scenario_id = uuidv4();

  const outcomes = [
    {
      step: 1,
      description: 'Initial shock: energy markets react with 8% price spike.',
      severity: 6.0 + (variables.oil_price_shock || 0) * 3,
      probability: 0.85,
      affected_regions: ['Europe', 'Middle East'],
    },
    {
      step: 2,
      description: 'Diplomatic channels activated; UN emergency session called.',
      severity: 5.5,
      probability: 0.70,
      affected_regions: ['Global'],
    },
    {
      step: 3,
      description: "Humanitarian crisis deepens; refugee flows increase by 40%.",
      severity: 7.8,
      probability: 0.65,
      affected_regions: ['Eastern Europe', 'Central Asia'],
    },
    {
      step: 4,
      description: 'Economic sanctions imposed; secondary market effects emerge.',
      severity: 6.2,
      probability: 0.55,
      affected_regions: ['Europe', 'North America'],
    },
  ];

  const overall_risk =
    outcomes.reduce((sum, o) => sum + o.severity * o.probability, 0) / outcomes.length;

  return {
    scenario_id,
    scenario_description,
    outcomes,
    overall_risk: Math.round(Math.min(10, overall_risk) * 100) / 100,
    summary: `Simulation of '${scenario_description}' projects moderate-to-high risk (score ${overall_risk.toFixed(1)}/10) over ${time_horizon_days} days.`,
  };
}
