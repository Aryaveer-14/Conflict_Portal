/**
 * src/config/db.js
 * ----------------
 * MongoDB connection setup using Mongoose.
 * Provides connectDB() used at server startup.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

export async function connectDB() {
  // Skip connection if URI is missing or still the placeholder
  if (!MONGODB_URI || MONGODB_URI === 'PASTE_YOUR_ATLAS_URI_HERE') {
    console.warn('⚠️  MONGODB_URI not configured — running without MongoDB.');
    console.warn('   Set MONGODB_URI in server/.env to enable data persistence.');
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.warn('⚠️  Running without MongoDB — data will not be persisted.');
    // Don't crash the server; routes degrade gracefully to stub data.
  }
}
