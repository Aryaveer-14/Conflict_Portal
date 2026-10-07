/**
 * scripts/seed.js
 * ---------------
 * Seeds MongoDB with initial conflict event stub data.
 * Run with: npm run seed
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import ConflictEvent from '../models/ConflictEvent.js';

dotenv.config({ path: '../.env' });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gcip';

const SEED_EVENTS = [
  {
    title: 'Armed conflict escalation in Eastern Region',
    event_date: new Date(Date.now() - 0 * 6 * 3600 * 1000),
    source_url: 'https://gdeltproject.org',
    country: 'UA',
    region: 'Eastern Europe',
    latitude: 48.3794,
    longitude: 31.1656,
    severity: 7.5,
    goldstein_scale: -6.5,
    num_articles: 342,
    categories: ['armed conflict', 'military'],
  },
  {
    title: 'Ceasefire negotiations collapse in Middle East',
    event_date: new Date(Date.now() - 1 * 6 * 3600 * 1000),
    source_url: 'https://gdeltproject.org',
    country: 'PS',
    region: 'Middle East',
    latitude: 31.9,
    longitude: 35.2,
    severity: 8.2,
    goldstein_scale: -7.0,
    num_articles: 580,
    categories: ['diplomatic', 'armed conflict'],
  },
  {
    title: 'Humanitarian corridor blocked in West Africa',
    event_date: new Date(Date.now() - 2 * 6 * 3600 * 1000),
    source_url: 'https://gdeltproject.org',
    country: 'ML',
    region: 'West Africa',
    latitude: 17.5,
    longitude: -4.0,
    severity: 6.1,
    goldstein_scale: -5.0,
    num_articles: 89,
    categories: ['humanitarian', 'blockade'],
  },
  {
    title: 'Trade route disruptions impact South China Sea',
    event_date: new Date(Date.now() - 3 * 6 * 3600 * 1000),
    source_url: 'https://gdeltproject.org',
    country: 'CN',
    region: 'East Asia',
    latitude: 14.5,
    longitude: 115.0,
    severity: 5.8,
    goldstein_scale: -3.5,
    num_articles: 210,
    categories: ['economic', 'maritime'],
  },
  {
    title: 'Sanctions imposed following border incursion',
    event_date: new Date(Date.now() - 4 * 6 * 3600 * 1000),
    source_url: 'https://gdeltproject.org',
    country: 'RU',
    region: 'Eastern Europe',
    latitude: 55.75,
    longitude: 37.62,
    severity: 6.9,
    goldstein_scale: -4.8,
    num_articles: 455,
    categories: ['diplomatic', 'economic'],
  },
];

async function seed() {
  console.log('🌱 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected.');

  const existing = await ConflictEvent.countDocuments();
  if (existing > 0) {
    console.log(`ℹ️  Database already has ${existing} events. Skipping seed.`);
    console.log('   Use --force flag to re-seed: node scripts/seed.js --force');
    if (!process.argv.includes('--force')) {
      await mongoose.disconnect();
      return;
    }
    await ConflictEvent.deleteMany({});
    console.log('🗑️  Cleared existing events.');
  }

  const result = await ConflictEvent.insertMany(SEED_EVENTS);
  console.log(`✅ Seeded ${result.length} conflict events into MongoDB.`);
  await mongoose.disconnect();
  console.log('👋 Done.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
