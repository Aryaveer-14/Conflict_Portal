# Global Conflict Impact Intelligence Platform (GCIP)

A hackathon project that provides AI-powered analysis of global conflicts, narrative extraction from news, and socioeconomic impact intelligence using Google Gemini API.

## Architecture Overview

```
React Frontend (Vite)
  ↓
Axios API Client (frontend/src/api/client.js)
  ↓
FastAPI Backend
  ├─ /api/agent (AI conflict analyst)
  ├─ /api/narratives (narrative extraction)
  ├─ /api/events (conflict events data)
  ├─ /api/commodities (global commodity prices)
  └─ /api/impact (socioeconomic impact analysis)
  ↓
Google Gemini API (gemini-1.5-flash)
```

## Prerequisites

- **Docker** and **Docker Compose** (recommended)
- **Python 3.12+** (for local development)
- **Node.js 20+** (for local frontend development)
- **Google Gemini API Key** — [Get one free](https://aistudio.google.com)

## Quick Start (Docker)

### 1. Set Up Environment Variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# Frontend  
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed (defaults should work in Docker)
```

**backend/.env:**
```
GEMINI_API_KEY=your_key_here
DEBUG=False
LOG_LEVEL=info
```

### 2. Start Services

```bash
docker compose up --build
```

Services will be available at:
- 🔵 **Backend API**: http://localhost:8000
- 🟦 **Frontend**: http://localhost:5173
- 📚 **API Docs**: http://localhost:8000/docs

## Quick Start (Local Development)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows

# Install dependencies
pip install -r requirements.txt

# Set up .env
cp .env.example .env
# Edit .env and add GEMINI_API_KEY

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Set up .env
cp .env.example .env
# Edit VITE_API_BASE_URL if needed (default: http://localhost:8000/api)

# Run development server
npm run dev
```

## API Endpoints

### 1. **AI Agent Endpoint**

Query the Gemini-powered conflict analyst.

```bash
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does the Sudan conflict affect global oil supply?",
    "context": ""
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "The Sudan conflict disrupts regional oil supply by..."
  }
}
```

### 2. **Narratives Endpoint**

Extract dominant narratives from news headlines.

```bash
curl -X POST "http://localhost:8000/api/narratives/?headlines=Oil%20prices%20surge%20after%20attacks&headlines=Shipping%20disruption%20grows" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "narratives": [
      {
        "label": "Oil supply crisis",
        "description": "Public concern about disruption of energy supply chains.",
        "prevalence_score": 85
      }
    ]
  }
}
```

### 3. **Events Endpoint**

Retrieve global conflict events.

```bash
curl http://localhost:8000/api/events/?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "evt_001",
        "title": "Armed clashes in Sudan border region",
        "country": "Sudan",
        "region": "East Africa",
        "latitude": 15.5,
        "longitude": 32.5,
        "casualties": 250,
        "date": "2024-03-12T...",
        "severity": "critical"
      }
    ],
    "total": 5
  }
}
```

### 4. **Commodities Endpoint**

Get global commodity prices affected by conflicts.

```bash
curl http://localhost:8000/api/commodities/
```

**Response:**
```json
{
  "success": true,
  "data": {
    "commodities": [
      {
        "id": "com_001",
        "name": "Crude Oil (Brent)",
        "price": 88.45,
        "change_percent": 12.5,
        "supply_impact": "high"
      }
    ]
  }
}
```

### 5. **Impact Analysis Endpoint**

Generate AI-powered socioeconomic impact analysis.

```bash
curl -X POST http://localhost:8000/api/impact/ \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_001",
    "event_data": {
      "title": "Sudan clashes",
      "country": "Sudan",
      "casualties": 250,
      "description": "Armed conflict in the region"
    },
    "include_commodities": true
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event_id": "evt_001",
    "analysis_text": "...",
    "sections": [
      {
        "title": "Executive Summary",
        "content": "..."
      }
    ]
  }
}
```

## Frontend Integration

### useConflictData Hook

```javascript
import useConflictData from "./hooks/useConflictData";

function Dashboard() {
  const { events, commodities, loading, errors, refresh } = useConflictData();

  return (
    <div>
      {loading.events ? "Loading..." : <EventsMap events={events} />}
      {errors.events && <Alert>{errors.events}</Alert>}
      <button onClick={refresh}>Refresh Data</button>
    </div>
  );
}
```

### API Client

```javascript
import { agentAPI, eventsAPI, narrativesAPI, commoditiesAPI, impactAPI } from "./api/client";

// Query the AI agent
const res = await agentAPI.query("How does this affect oil supply?");
console.log(res.data.data.response);

// Get events
const events = await eventsAPI.getAll(20);

// Extract narratives
const narratives = await narrativesAPI.getNarratives("evt_001");
```

## File Structure

```
Conflict_Portal/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt            # Python dependencies
│   ├── Dockerfile                 # Backend container image
│   ├── .env.example               # Environment template
│   ├── routers/
│   │   ├── agent.py               # / endpoint (Gemini agent)
│   │   ├── narratives.py          # Narrative extraction
│   │   ├── events.py              # Conflict events
│   │   ├── commodities.py         # Commodity prices
│   │   └── impact.py              # Impact analysis
│   └── services/
│       ├── gemini_service.py      # Gemini API wrapper
│       └── narrative_service.py   # Narrative extraction logic
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx               # React entry point
│   │   ├── api/
│   │   │   └── client.js          # Axios API client
│   │   └── hooks/
│   │       └── useConflictData.js # Data fetching hook
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docker-compose.yml             # Service orchestration
└── README.md                       # This file
```

## Development Workflow

### 1. Backend Development

- Edit Python files in `backend/`
- Docker automatically reloads on save (live-reload enabled)
- View API docs at http://localhost:8000/docs
- Check logs: `docker logs gcip_backend`

### 2. Frontend Development

- Edit React files in `frontend/`
- Vite auto-refreshes on save
- Check logs: `docker logs gcip_frontend`

### 3. Testing Endpoints

Use the interactive API docs:
```
http://localhost:8000/docs
```

Or use curl:
```bash
# Test agent endpoint
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Sudan?", "context": ""}'

# Test events endpoint
curl http://localhost:8000/api/events/
```

## Key Components

### Backend

#### `gemini_service.py`
- Configures Google Gemini API
- Exposes `ask_gemini(prompt)` function
- Handles errors and rate limiting

#### `narrative_service.py`
- Extracts narratives from news headlines
- Formats output as structured JSON
- Sanitizes and validates JSON from Gemini

#### `agent.py`
- POST `/api/agent/` endpoint
- Accepts user queries about conflicts
- Returns AI-generated geopolitical analysis

#### `events.py`, `commodities.py`, `impact.py`
- Mock data endpoints for dashboard
- In production: connect to real databases

### Frontend

#### `client.js`
- Axios instance with interceptors
- Modules: `eventsAPI`, `narrativesAPI`, `agentAPI`, `commoditiesAPI`, `impactAPI`
- Automatic error handling and logging

#### `useConflictData.js`
- Custom React hook
- Fetches events and commodities
- Auto-refreshes every 5 minutes
- Granular loading/error states

## Deployment

### Docker Compose (Production-Ready)

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop services
docker compose down
```

### Environment Variables for Deployment

Update `.env` files with production values:

```bash
# backend/.env
GEMINI_API_KEY=<your_production_key>
DEBUG=False
LOG_LEVEL=warning

# frontend/.env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Troubleshooting

### Backend won't start

```bash
# Check logs
docker logs gcip_backend

# Verify GEMINI_API_KEY is set
docker exec gcip_backend printenv | grep GEMINI
```

### Frontend can't reach backend

- Verify `VITE_API_BASE_URL` in `frontend/.env`
- In Docker: should be `http://backend:8000/api`
- In local dev: should be `http://localhost:8000/api`

### Gemini API errors

- Verify API key is valid
- Check rate limits (free tier has limits)
- Review error response in http://localhost:8000/docs

## Performance Optimization Tips

1. **Async Processing**: Impact analysis can be slow (10-30s) — consider:
   - Add async job queue (Celery + Redis)
   - Return job ID immediately, poll for results

2. **Response Caching**: Cache Gemini responses by event_id:
   - Store in database or Redis
   - Invalidate on new data

3. **Batch Requests**: Group multiple headlines for narrative extraction

4. **Frontend State Management**: Consider Redux or Zustand for larger app

## Team Roles

- **Member C (You)**: AI/ML Lead, Integration Architect, DevOps
  - Prompt engineering ✅
  - Gemini API integration ✅
  - Narrative extraction ✅
  - Agent endpoint ✅
  - Frontend-backend APIs ✅
  - Docker setup ✅
  - Data hooks ✅

## Next Steps

1. ✅ All backend services implemented
2. ✅ All frontend APIs configured
3. ✅ Docker setup complete
4. **Testing**: Run integration tests
5. **Features**: Add real data sources (news APIs, market data APIs)
6. **Optimization**: Add caching and async job queues
7. **Deployment**: Push to cloud (AWS, GCP, Azure)

## License

Hackathon project – MIT License

---

**Happy hacking! 🚀**

For questions or issues, check the API docs at http://localhost:8000/docs
