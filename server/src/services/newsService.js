/**
 * services/newsService.js
 * -----------------------
 * Service layer for fetching conflict news articles.
 * Port of news_service.py — same NewsAPI integration + same fallback stubs.
 * Added MongoDB caching layer to avoid rate limits.
 */

import axios from 'axios';
import dotenv from 'dotenv';
import NewsCache from '../models/NewsCache.js';
import mongoose from 'mongoose';

dotenv.config();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

const isDBConnected = () => mongoose.connection.readyState === 1;
const GDELT_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';

// ── Stub data (same content as Python version) ────────────────────────────────
const TOPICS = {
  escalation: [
    ['Military Forces Deploy Near Border Regions', 'Satellite imagery confirms significant troop movements along contested borders, raising concerns of imminent escalation.', 'Janes Defence'],
    ['Artillery Exchange Reported Overnight', 'Continuous shelling was recorded in the buffer zone. Civilian areas have been evacuated.', 'Reuters'],
    ['Emergency UN Security Council Meeting Called', 'Diplomats scramble to pass a resolution condemning the recent wave of airstrikes.', 'AP News'],
  ],
  supply: [
    ['Trade Route Blockade Impacts Global Shipping', 'Vessels have been rerouted past the cape, adding 14 days to transit times and straining supply chains.', 'Bloomberg'],
    ['Commodity Prices Spike on Sanction Fears', 'Markets reacted violently to rumors of impending sanctions on critical rare-earth mineral exports.', 'Financial Times'],
    ['Port Operations Halted by Cyber Attack', 'Major logistics hubs remain paralyzed following a coordinated ransomware attack affecting regional ports.', 'CyberIntel Data'],
  ],
  diplomacy: [
    ['Peace Talks Resume in Neutral Territory', 'Delegations from both factions have agreed to a 48-hour ceasefire to allow humanitarian corridors.', 'Al Jazeera'],
    ['Foreign Ministers Propose Broad De-escalation Plan', 'A joint statement was issued hoping to establish demilitarized zones and international monitoring.', 'BBC News'],
    ['Prisoner Exchange Initiated', 'A successful exchange of 50 captives was completed this morning, an optimistic sign for upcoming negotiations.', 'Reuters'],
  ],
};

function getStubArticles(query, limit) {
  const general = [
    [`Global Intelligence Analysts Issue New Threat Assessment`, `Recent developments regarding ${query} indicate shifting alliances and fluid border control.`, 'Stratfor'],
    [`Economic Fallout Predicted Amidst Regional Instability`, `Experts expect the ongoing tension regarding ${query} to lower regional GDP growth by 2%.`, 'The Economist'],
    ['Humanitarian Crisis Deepens as Infrastructure Collapses', 'Power and water supplies have been disrupted across major metropolitan areas, affecting millions.', 'Red Cross Intel'],
    ['Civil Unrest Over Resource Shortages', 'Protests broke out across several capitals demanding immediate governmental action.', 'AP News'],
  ];

  const qLower = query.toLowerCase();
  let pool;
  if (qLower.includes('escalation') || qLower.includes('war')) {
    pool = [...TOPICS.escalation, ...general];
  } else if (qLower.includes('supply') || qLower.includes('trade')) {
    pool = [...TOPICS.supply, ...general];
  } else if (qLower.includes('diplomacy') || qLower.includes('peace')) {
    pool = [...TOPICS.diplomacy, ...general];
  } else {
    pool = [...general, ...TOPICS.escalation, ...TOPICS.supply, ...TOPICS.diplomacy];
  }

  const results = [];
  let chronoOffset = 10; // minutes ago
  const poolLen = pool.length;
  for (let i = 0; i < Math.min(limit, poolLen); i++) {
    const idx = (i * 3 + query.length) % poolLen;
    const [headline, desc, source] = pool[idx];
    results.push({
      title: headline,
      description: desc,
      source,
      url: `https://gcip.intel/news/report-${i}`,
      published_at: new Date(Date.now() - chronoOffset * 60 * 1000).toISOString(),
      image_url: null,
      sentiment: parseFloat((Math.random() * 1.3 - 0.8).toFixed(2)),
    });
    chronoOffset += 15 + Math.floor(Math.random() * 45);
  }
  return results;
}

async function fetchGdeltArticles(query, limit) {
  const response = await axios.get(GDELT_URL, {
    params: { query, mode: 'artlist', maxrecords: Math.min(limit, 50), format: 'json', timespan: '24h', sort: 'HybridRel' },
    timeout: 10000,
  });

  return (response.data.articles || []).map((article) => ({
    title: article.title || 'Untitled',
    description: article.title || 'Live conflict-related report from GDELT.',
    source: article.domain || article.sourcecountry || 'GDELT',
    url: article.url || '',
    published_at: article.seendate ? new Date(article.seendate.replace(/(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T')).toISOString() : new Date().toISOString(),
    image_url: null,
    sentiment: 0.0,
  }));
}

/**
 * Fetch news articles. Checks MongoDB cache first, then NewsAPI, then stubs.
 */
export async function fetchNews(query, limit = 20) {
  // 1. Check MongoDB cache
  if (isDBConnected()) {
    const cached = await NewsCache.findOne({ query }).lean();
    if (cached) {
      return cached.articles.slice(0, limit);
    }
  }

  // 2. Try real NewsAPI
  if (NEWS_API_KEY && NEWS_API_KEY.trim()) {
    try {
      const response = await axios.get(NEWS_API_URL, {
        params: {
          q: query,
          sortBy: 'publishedAt',
          pageSize: Math.min(limit, 50),
          language: 'en',
          apiKey: NEWS_API_KEY,
        },
        timeout: 10000,
      });

      const articles = (response.data.articles || []).map((a) => ({
        title: a.title || 'Untitled',
        description: a.description || '',
        source: a.source?.name || 'Unknown Source',
        url: a.url || '',
        published_at: a.publishedAt || new Date().toISOString(),
        image_url: a.urlToImage || null,
        sentiment: 0.0,
      }));

      if (articles.length > 0) {
        // Cache in MongoDB for 30 min
        if (isDBConnected()) {
          await NewsCache.findOneAndUpdate(
            { query },
            { query, articles, fetched_at: new Date() },
            { upsert: true, new: true }
          );
        }
        return articles;
      }
    } catch (err) {
      console.error('[newsService] NewsAPI error:', err.message);
    }
  }

  // Keep the feed live even when NewsAPI is unavailable or rate-limited.
  try {
    const gdeltArticles = await fetchGdeltArticles(query, limit);
    if (gdeltArticles.length > 0) return gdeltArticles;
  } catch (err) {
    console.error('[newsService] GDELT fallback error:', err.message);
  }

  // 3. Fallback to stubs
  return getStubArticles(query, limit);
}
