# Integration Testing Checklist

Complete this checklist to verify all GCIP components are working correctly.

## Pre-Flight Checks

- [ ] Docker Desktop is running
- [ ] Git repository is up to date
- [ ] GEMINI_API_KEY is set in `backend/.env`
- [ ] Port 8000 (backend) is available
- [ ] Port 5173 (frontend) is available
- [ ] Port 5432 (optional DB) is available if using database

## Backend Service Checks

### 1. Start Services

```bash
# Navigate to project root
cd ~/Desktop/Conflict_Portal

# Start Docker services
docker compose up --build

# Wait for both services to be healthy (look for "healthy" in logs)
```

- [ ] Backend container starts without errors
- [ ] Frontend container starts without errors
- [ ] Backend health check passes
- [ ] No error messages in logs related to GEMINI_API_KEY

### 2. Health Endpoints

Test these URLs in your browser or with curl:

```bash
# Backend health
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "ok", "service": "GCIP Backend"}
```

- [ ] ✓ Backend health check returns 200 OK
- [ ] ✓ Response includes correct service name

### 3. API Documentation

Open these in your browser:

- [ ] ✓ http://localhost:8000/docs (Swagger UI) loads correctly
- [ ] ✓ All 5 routers are listed (agent, narratives, events, commodities, impact)
- [ ] ✓ Each endpoint has proper description and example
- [ ] ✓ http://localhost:8000/redoc (ReDoc) loads correctly

## Individual Endpoint Tests

Use the Swagger UI (http://localhost:8000/docs) or curl commands below.

### Agent Endpoint

**Test Valid Query:**
```bash
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the main drivers of the Sudan conflict?",
    "context": ""
  }'
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes `success: true`
- [ ] ✓ Response includes `data.response` with AI-generated text
- [ ] ✓ Response is reasonable length (not empty or truncated)

**Test with Context:**
```bash
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{
    "query": "How does this affect commodity prices?",
    "context": "Discussing Sudan conflict and global supply chains"
  }'
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response incorporates context in analysis

**Test Invalid Query (should fail):**
```bash
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query": "Hi", "context": ""}'  # Too short
```

- [ ] ✓ Returns HTTP 422 (validation error)

### Events Endpoint

**Test Get All Events:**
```bash
curl "http://localhost:8000/api/events/?limit=10"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes array of events
- [ ] ✓ Each event has required fields: id, title, country, latitude, longitude
- [ ] ✓ Limit parameter is respected (max 10 returned)

**Test Get Specific Event:**
```bash
curl "http://localhost:8000/api/events/evt_001"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes single event object
- [ ] ✓ Event has all expected fields

**Test Get Events by Region:**
```bash
curl "http://localhost:8000/api/events/by-region/Middle%20East"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response filters events by region correctly
- [ ] ✓ Only events from specified region are returned

### Commodities Endpoint

**Test Get All Commodities:**
```bash
curl "http://localhost:8000/api/commodities/"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes array of commodities
- [ ] ✓ Each commodity has: price, change_percent, supply_impact
- [ ] ✓ Prices are realistic numbers

**Test Filter by Category:**
```bash
curl "http://localhost:8000/api/commodities/?category=energy"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Only energy commodities returned (oil, gas)

**Test High-Impact Commodities:**
```bash
curl "http://localhost:8000/api/commodities/by-impact/high"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ All returned commodities have supply_impact="high"

**Test Trending:**
```bash
curl "http://localhost:8000/api/commodities/trending?limit=5"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Returns top 5 commodities by price change
- [ ] ✓ Sorted by absolute change_percent (descending)

### Narratives Endpoint

**Test Extract Narratives:**
```bash
curl -X POST "http://localhost:8000/api/narratives/?headlines=Oil prices surge&headlines=Shipping disruption grows"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes narratives array
- [ ] ✓ Each narrative has: label, description, prevalence_score (0-100)
- [ ] ✓ Narratives are ranked by prevalence_score (descending)

**Test Get Event Narratives:**
```bash
curl "http://localhost:8000/api/narratives/event/evt_001"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes cached/placeholder narratives

### Impact Analysis Endpoint

**Test Request Impact Analysis:**
```bash
curl -X POST http://localhost:8000/api/impact/ \
  -H "Content-Type: application/json" \
  -d '{
    "event_id": "evt_001",
    "event_data": {
      "title": "Sudan armed clashes",
      "country": "Sudan",
      "casualties": 250,
      "description": "Armed conflict in border region"
    },
    "include_commodities": true
  }'
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes success: true
- [ ] ✓ Response includes analysis_text (can be long, 1000+ chars)
- [ ] ✓ Response includes sections array
- [ ] ✓ Analysis text is coherent and structured

**Test Get Cached Impact:**
```bash
curl "http://localhost:8000/api/impact/event/evt_001"
```

- [ ] ✓ Returns HTTP 200
- [ ] ✓ Response includes placeholder analysis

## Frontend Integration Tests

### 1. Frontend Accessibility

- [ ] ✓ http://localhost:5173 loads without errors
- [ ] ✓ React app renders in browser
- [ ] ✓ No 404 errors in browser console

### 2. API Client Tests

Open browser developer console (F12) and test:

```javascript
// Test imports
import { eventsAPI, agentAPI, commoditiesAPI } from './api/client.js';

// Test events API
await eventsAPI.getAll(10);
// Should return array of events

// Test agent API
await agentAPI.query("What is Sudan?", {});
// Should return agent response

// Test commodities API
await commoditiesAPI.getAll();
// Should return array of commodities
```

- [ ] ✓ API client can be imported in browser console
- [ ] ✓ API calls execute without CORS errors
- [ ] ✓ API responses match expected format
- [ ] ✓ Error handling works (try invalid endpoint)

### 3. useConflictData Hook Tests

If you have components using the hook:

```javascript
// In a component
import useConflictData from './hooks/useConflictData.js';

const { events, commodities, loading, errors, refresh } = useConflictData();

// Test: events should be array
console.log(Array.isArray(events)); // Should be true

// Test: loading should update
console.log(loading); // { events: boolean, commodities: boolean }

// Test: refresh function exists
typeof refresh === 'function'; // Should be true

// Test: auto-refresh works after 5 minutes
```

- [ ] ✓ Hook initializes correctly
- [ ] ✓ Data fetches on mount
- [ ] ✓ Loading states update properly
- [ ] ✓ Errors are captured and displayed
- [ ] ✓ Auto-refresh works (wait 5+ minutes or check implementation)
- [ ] ✓ Refresh function can be called manually

## Integration Flow Tests

### End-to-End Flow 1: Dashboard Data Loading

1. Open http://localhost:5173
2. Component calls `useConflictData()`
3. Hook calls `eventsAPI.getAll()` and `commoditiesAPI.getAll()`
4. Frontend displays:
   - [ ] ✓ Conflict events on map (or list)
   - [ ] ✓ Commodity prices with change indicators
   - [ ] ✓ Loading states while fetching
   - [ ] ✓ Data updates without full page reload

### End-to-End Flow 2: AI Analysis Request

1. User enters query in frontend: "How does Sudan affect oil?"
2. Frontend calls `agentAPI.query(userQuestion)`
3. Request reaches backend `/api/agent/` endpoint
4. Backend calls Gemini API with system prompt + user query
5. Response returns to frontend
   - [ ] ✓ No CORS errors
   - [ ] ✓ Response time < 30 seconds
   - [ ] ✓ AI generates coherent response
   - [ ] ✓ Response displays in UI

### End-to-End Flow 3: Narrative Extraction

1. Backend receives headlines from frontend
2. Calls Gemini with narrative prompt
3. Parses JSON response
4. Returns structure with prevalence scores
   - [ ] ✓ Narratives are extracted
   - [ ] ✓ Scores are 0-100
   - [ ] ✓ Sorted by prevalence
   - [ ] ✓ Frontend displays properly

## Error Handling Tests

### Test Network Errors

Stop backend and test:
```bash
curl http://localhost:8000/api/events/
```

- [ ] ✓ Frontend shows connection error
- [ ] ✓ Error message is user-friendly
- [ ] ✓ UI doesn't crash

### Test Invalid API Key

Modify `backend/.env` and set `GEMINI_API_KEY=invalid_key`:

```bash
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query":"Test","context":""}'
```

- [ ] ✓ Returns HTTP 502
- [ ] ✓ Error message explains Gemini API issue
- [ ] ✓ Frontend displays error gracefully

### Test Malformed Requests

```bash
# Missing required field
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"context":""}'  # Missing 'query'
```

- [ ] ✓ Returns HTTP 422 (validation error)
- [ ] ✓ Response includes field error details

## Performance Tests

### Response Times

Test these endpoints and record times:

```bash
# Events (should be < 100ms)
time curl http://localhost:8000/api/events/

# Commodities (should be < 100ms)
time curl http://localhost:8000/api/commodities/

# Agent (should be 5-30s, depends on Gemini)
time curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Sudan?","context":""}'

# Impact (should be 10-30s, depends on Gemini)
time curl -X POST http://localhost:8000/api/impact/ \
  -H "Content-Type: application/json" \
  -d '{...}'
```

- [ ] ✓ Events/commodities respond < 200ms
- [ ] ✓ Agent analysis takes 5-30s (acceptable for AI)
- [ ] ✓ Impact analysis takes 10-30s
- [ ] ✓ No timeout errors

### Memory/CPU

Open Docker stats while running:
```bash
docker stats
```

- [ ] ✓ Backend memory usage < 500MB
- [ ] ✓ Frontend memory usage < 200MB
- [ ] ✓ CPU usage stays reasonable (not constantly maxed)

## Docker Deployment Test

### Clean Deployment

```bash
# Stop existing containers
docker compose down

# Remove volumes
docker volume prune -f

# Full rebuild
docker compose up --build

# Check logs for errors
docker compose logs -f backend
docker compose logs -f frontend
```

- [ ] ✓ Both containers start successfully
- [ ] ✓ Backend health check passes
- [ ] ✓ Frontend is accessible after container starts
- [ ] ✓ No port conflicts

### Service Interdependencies

- [ ] ✓ Frontend can reach backend (depends_on works)
- [ ] ✓ Backend can reach Gemini API
- [ ] ✓ Services restart gracefully on crash

## Final Sign-Off

**Testing completed by:** _______________  
**Date:** _______________  

- [ ] All endpoint tests passed
- [ ] All integration flows work
- [ ] Error handling is appropriate
- [ ] Performance is acceptable
- [ ] Docker deployment is working
- [ ] Documentation is accurate

**Issues found and fixed:**
```
1. 
2. 
3. 
```

**Ready for production:** [ ] Yes [ ] No

---

### Quick Pass/Fail Checklist (TL;DR)

Run this fast checklist:

```bash
# 1. Backend health
curl http://localhost:8000/health | grep ok

# 2. API docs exist
curl http://localhost:8000/docs | grep -q "Swagger"

# 3. Agent works
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query":"test","context":""}' | grep -q "success"

# 4. Events work
curl http://localhost:8000/api/events/ | grep -q "evt_001"

# 5. Frontend loads
curl http://localhost:5173 | grep -q "<!DOCTYPE"
```

If all 5 return data with expected content → ✅ **System is operational**
