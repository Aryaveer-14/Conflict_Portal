/**
 * models/ConflictEvent.js
 * -----------------------
 * Mongoose model for persisting conflict events fetched from GDELT.
 * MongoDB gives us caching, filtering, and historical queries.
 */

import mongoose from 'mongoose';

const conflictEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    event_date: { type: Date, required: true },
    source_url: { type: String, default: '' },
    country: { type: String, default: '' },
    region: { type: String, default: '' },
    latitude: { type: Number, default: 0 },
    longitude: { type: Number, default: 0 },
    severity: { type: Number, min: 0, max: 10, default: 0 },
    goldstein_scale: { type: Number, default: 0 },
    num_articles: { type: Number, default: 0 },
    categories: [{ type: String }],
  },
  {
    timestamps: true,   // Adds createdAt + updatedAt automatically
    versionKey: false,
  }
);

// Index for fast country/region lookups
conflictEventSchema.index({ country: 1, region: 1 });
conflictEventSchema.index({ event_date: -1 });

const ConflictEvent = mongoose.model('ConflictEvent', conflictEventSchema);
export default ConflictEvent;
