/**
 * services/impactService.js
 * -------------------------
 * Service layer for cascade impact scoring.
 * Port of impact_service.py — identical logic.
 */

/**
 * Compute cascade impact scores for a given conflict event.
 */
export async function computeImpact({
  event_id,
  region = null,
  include_economic = true,
  include_humanitarian = true,
} = {}) {
  const dimensions = [];

  if (include_economic) {
    dimensions.push({
      dimension: 'economic',
      score: 7.2,
      confidence: 0.85,
      description: 'Significant disruption to energy supply chains; oil prices expected to spike 8-12%.',
      affected_countries: ['DE', 'PL', 'FR'],
    });
  }

  if (include_humanitarian) {
    dimensions.push({
      dimension: 'humanitarian',
      score: 8.5,
      confidence: 0.90,
      description: 'Estimated 50k displaced civilians; urgent need for medical supplies and shelter.',
      affected_countries: ['UA', 'PL', 'MD'],
    });
  }

  dimensions.push({
    dimension: 'political',
    score: 6.8,
    confidence: 0.72,
    description: 'NATO alliance tensions rising; emergency summit anticipated.',
    affected_countries: ['US', 'UK', 'DE', 'FR'],
  });

  const overall = dimensions.length > 0
    ? dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
    : 0;

  const risk_level =
    overall >= 8 ? 'critical' :
    overall >= 6 ? 'high' :
    overall >= 4 ? 'medium' : 'low';

  return {
    event_id,
    overall_score: Math.round(overall * 100) / 100,
    risk_level,
    dimensions,
    cascade_chain: [
      'Energy supply disruption',
      'Commodity price spike',
      'Inflation pressure on EU',
      'Humanitarian corridor strain',
      'Diplomatic escalation',
    ],
  };
}
