/**
 * services/gdeltService.js
 * ------------------------
 * Service layer for fetching conflict events from GDELT / MongoDB.
 * Port of gdelt_service.py — same stub data, with MongoDB persistence layer added.
 */

import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';
import ConflictEvent from '../models/ConflictEvent.js';
import mongoose from 'mongoose';

dotenv.config();

const isDBConnected = () => mongoose.connection.readyState === 1;
const GDELT_URL = 'https://api.gdeltproject.org/api/v2/doc/doc';
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const LIVE_CACHE_TTL_MS = 15 * 60 * 1000;
let liveCache = { expiresAt: 0, events: [] };

const COUNTRY_COORDS = {
  Ukraine: [48.3794, 31.1656], Sudan: [12.8628, 30.2176], Yemen: [15.5527, 48.5164],
  Syria: [34.8021, 38.9968], Gaza: [31.3547, 34.3088], Israel: [31.0461, 34.8516],
  Haiti: [18.9712, -72.2852], Myanmar: [21.9162, 95.956], Nigeria: [9.082, 8.6753],
  Mexico: [23.6345, -102.5528], Colombia: [4.5709, -74.2973], Afghanistan: [33.9391, 67.71],
};

function getCoordinates(country = '') {
  const match = Object.entries(COUNTRY_COORDS).find(([name]) =>
    country.toLowerCase().includes(name.toLowerCase())
  );
  return match?.[1] || [0, 0];
}

function scoreSeverity(title = '') {
  const text = title.toLowerCase();
  if (/massacre|genocide|nuclear|chemical weapon/.test(text)) return 10;
  if (/war|invasion|airstrike|bombing|killed|offensive/.test(text)) return 8;
  if (/attack|conflict|military|troops|armed|shelling/.test(text)) return 6;
  if (/protest|sanctions|tension|unrest|clash/.test(text)) return 4;
  return 2;
}

async function fetchNewsApiEvents(limit) {
  if (!NEWS_API_KEY) return [];

  const response = await axios.get(NEWS_API_URL, {
    params: {
      q: 'armed conflict',
      sortBy: 'publishedAt',
      pageSize: Math.min(limit, 50),
      language: 'en',
      apiKey: NEWS_API_KEY,
    },
    timeout: 10000,
  });

  const relevantArticles = (response.data.articles || []).filter((article) =>
    /war|conflict|military|attack|clash|invasion|troops|airstrike|violence|ceasefire/i.test(article.title || '')
  );

  return relevantArticles.slice(0, limit).map((article, index) => {
    const text = `${article.title || ''} ${article.description || ''}`;
    const country = Object.keys(COUNTRY_COORDS).find((name) =>
      text.toLowerCase().includes(name.toLowerCase())
    ) || 'Global';
    const [latitude, longitude] = getCoordinates(country);
    return {
      id: `news-event-${index}-${Date.now()}`,
      title: article.title || 'Conflict development reported',
      location: country,
      country,
      region: country,
      lat: latitude,
      lon: longitude,
      latitude,
      longitude,
      severity: scoreSeverity(text),
      date: article.publishedAt || new Date().toISOString(),
      event_date: article.publishedAt || new Date().toISOString(),
      source_url: article.url || '',
      source: article.source?.name || 'NewsAPI',
    };
  });
}

async function fetchLiveEvents(limit) {
  if (liveCache.expiresAt > Date.now()) return liveCache.events.slice(0, limit);

  const response = await axios.get(GDELT_URL, {
    params: { query: 'conflict OR war OR military', mode: 'artlist', maxrecords: Math.min(limit, 50), format: 'json', timespan: '24h', sort: 'HybridRel' },
    timeout: 10000,
  });

  const events = (response.data.articles || []).map((article, index) => {
    const country = article.sourcecountry || 'Global';
    const [latitude, longitude] = getCoordinates(country);
    const title = article.title || 'Conflict development reported';
    return {
      id: `gdelt-${article.url || index}`,
      title,
      location: country,
      country,
      region: country,
      lat: latitude,
      lon: longitude,
      latitude,
      longitude,
      severity: scoreSeverity(title),
      date: article.seendate ? new Date(article.seendate.replace(/(\d{8})T(\d{6}).*/, '$1T$2Z').replace(/(\d{4})(\d{2})(\d{2})T/, '$1-$2-$3T')) : new Date().toISOString(),
      event_date: new Date().toISOString(),
      source_url: article.url || '',
      source: 'GDELT',
    };
  });

  liveCache = { expiresAt: Date.now() + LIVE_CACHE_TTL_MS, events };
  return events.slice(0, limit);
}

/**
 * Fetch conflict events. Reads from MongoDB if connected, otherwise returns stubs.
 */
export async function fetchEvents({
  limit = 25,
  offset = 0,
  country = null,
  region = null,
  start_date = null,
  end_date = null,
} = {}) {
  if (!country && !region && !start_date && !end_date && offset === 0) {
    try {
      const liveEvents = await fetchLiveEvents(limit);
      if (liveEvents.length > 0) return liveEvents;
    } catch (error) {
      console.warn('[GDELT] Live event refresh failed:', error.message);
    }

    try {
      const newsEvents = await fetchNewsApiEvents(limit);
      if (newsEvents.length > 0) return newsEvents;
    } catch (error) {
      console.warn('[NewsAPI] Live event refresh failed:', error.message);
    }
  }

  if (isDBConnected()) {
    const filter = {};
    if (country) filter.country = country;
    if (region) filter.region = { $regex: region, $options: 'i' };
    if (start_date || end_date) {
      filter.event_date = {};
      if (start_date) filter.event_date.$gte = new Date(start_date);
      if (end_date) filter.event_date.$lte = new Date(end_date);
    }

    const events = await ConflictEvent.find(filter)
      .sort({ event_date: -1 })
      .skip(offset)
      .limit(limit)
      .lean();

    if (events.length > 0) {
      return events.map((e) => ({ ...e, id: e._id.toString() }));
    }
  }

  // Stub data (same as Python version) when DB is empty or unavailable
  const stubs = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
    id: uuidv4(),
    title: 'Armed conflict escalation in Eastern Region',
    event_date: new Date(Date.now() - i * 6 * 3600 * 1000).toISOString(),
    source_url: 'https://gdeltproject.org',
    country: country || 'UA',
    region: region || 'Eastern Europe',
    latitude: 48.3794 + i * 0.1,
    longitude: 31.1656 + i * 0.1,
    severity: Math.min(10, 3.0 + i * 0.8),
    goldstein_scale: -5.0 + i * 0.5,
    num_articles: 120 - i * 10,
    categories: ['armed conflict', 'military'],
  }));

  return stubs.slice(offset, offset + limit);
}

/**
 * Fetch a single event by ID.
 */
export async function fetchEventById(eventId) {
  if (isDBConnected()) {
    try {
      const event = await ConflictEvent.findById(eventId).lean();
      if (event) return { ...event, id: event._id.toString() };
    } catch {
      // Invalid ObjectId or not found — fall through to stub
    }
  }

  return {
    id: eventId,
    title: 'Conflict event detail',
    event_date: new Date().toISOString(),
    source_url: 'https://gdeltproject.org',
    country: 'UA',
    region: 'Eastern Europe',
    latitude: 48.3794,
    longitude: 31.1656,
    severity: 6.5,
    goldstein_scale: -4.0,
    num_articles: 85,
    categories: ['armed conflict'],
  };
}
