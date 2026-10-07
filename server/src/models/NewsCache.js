/**
 * models/NewsCache.js
 * -------------------
 * Mongoose model for caching NewsAPI results to avoid rate limiting.
 * Cached articles expire after 30 minutes (TTL index).
 */

import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema({
  title: String,
  description: String,
  source: String,
  url: String,
  published_at: Date,
  image_url: String,
  sentiment: { type: Number, default: 0 },
});

const newsCacheSchema = new mongoose.Schema(
  {
    query: { type: String, required: true, index: true },
    articles: [newsArticleSchema],
    fetched_at: { type: Date, default: Date.now, expires: '30m' }, // TTL: auto-delete after 30 min
  },
  { versionKey: false }
);

const NewsCache = mongoose.model('NewsCache', newsCacheSchema);
export default NewsCache;
