/**
 * services/narrativeService.js
 * ----------------------------
 * Service layer for narrative extraction.
 * Port of narrative_service.py — same stub data.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Extract conflict narratives from news corpus.
 * TODO: Implement NLP-based narrative extraction.
 */
export async function extractNarratives({ event_id = null, query = null } = {}) {
  return [
    {
      id: uuidv4(),
      event_id: event_id || null,
      title: 'Escalation narrative detected',
      summary:
        'Multiple sources describe a pattern of military build-up along the border region, with humanitarian concerns rising.',
      key_actors: ['Government Forces', 'Opposition Groups', 'UN Observers'],
      themes: ['military escalation', 'humanitarian crisis', 'border security'],
      sentiment: -0.6,
      confidence: 0.78,
      created_at: new Date().toISOString(),
    },
  ];
}
