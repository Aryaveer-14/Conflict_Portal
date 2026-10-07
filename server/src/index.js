/**
 * src/index.js
 * ------------
 * Express.js application entry point for the GCIP MERN backend.
 * Mirrors all routes previously served by FastAPI.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

// Route imports
import eventsRouter from './routes/events.js';
import commoditiesRouter from './routes/commodities.js';
import newsRouter from './routes/news.js';
import narrativesRouter from './routes/narratives.js';
import impactRouter from './routes/impact.js';
import forecastRouter from './routes/forecast.js';
import simulateRouter from './routes/simulate.js';
import agentRouter from './routes/agent.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://frontend:5173',
  ],
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/events', eventsRouter);
app.use('/commodities', commoditiesRouter);
app.use('/news', newsRouter);
app.use('/narratives', narrativesRouter);
app.use('/impact', impactRouter);
app.use('/forecast', forecastRouter);
app.use('/simulate', simulateRouter);
app.use('/agent', agentRouter);

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'GCIP Express Backend', timestamp: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.json({
    message: 'Welcome to GCIP API (MERN Edition)',
    docs: 'See /health for status',
    routes: ['/events', '/commodities', '/news', '/narratives', '/impact', '/forecast', '/simulate', '/agent'],
  });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[GCIP] Unhandled error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start Server ──────────────────────────────────────────────────────────────
async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 GCIP Express server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n❌ Port ${PORT} is already in use.`);
      console.error(`   Run this to free it:  npx kill-port ${PORT}\n`);
    } else {
      console.error('Server error:', err);
    }
    process.exit(1);
  });
}

start();
