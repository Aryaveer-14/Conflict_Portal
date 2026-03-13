# GCIP Quick Reference Guide

Fast reference for common tasks during hackathon development.

## Startup & Shutdown

```bash
# Start everything (Docker)
cd ~/Desktop/Conflict_Portal
docker compose up --build

# View logs
docker compose logs -f backend    # Backend logs
docker compose logs -f frontend   # Frontend logs

# Stop everything
docker compose down

# Stop and remove volumes
docker compose down -v
```

## Debugging

### Check if Services are Healthy

```bash
# Backend health
curl http://localhost:8000/health

# Frontend accessibility
curl http://localhost:5173

# List containers
docker ps

# Inspect container
docker exec gcip_backend bash  # Get into backend container
docker exec gcip_frontend bash # Get into frontend container
```

### View Logs

```bash
# Real-time logs
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend

# Last 50 lines
docker logs --tail 50 gcip_backend
```

### Common Issues

**Backend won't start:**
```bash
# Check GEMINI_API_KEY
docker exec gcip_backend printenv | grep GEMINI

# View full error
docker logs gcip_backend
```

**Frontend can't connect to backend:**
```bash
# Check VITE_API_BASE_URL
echo $VITE_API_BASE_URL

# For Docker: should be http://backend:8000/api
# For local: should be http://localhost:8000/api
```

**Port already in use:**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

## API Testing

### Quick API Tests

```bash
# Health check
curl http://localhost:8000/health | jq

# List all events
curl http://localhost:8000/api/events/ | jq

# List all commodities
curl http://localhost:8000/api/commodities/ | jq

# Query AI agent
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Sudan?","context":""}' | jq

# Extract narratives
curl -X POST "http://localhost:8000/api/narratives/?headlines=Oil%20surge&headlines=Supply%20disruption" | jq
```

### API Documentation

- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Root**: http://localhost:8000

## File Locations

### Backend

```
backend/
├── main.py                      # Entry point
├── requirements.txt             # Dependencies
├── .env                        # Environment variables
├── routers/
│   ├── agent.py               # POST /api/agent/
│   ├── narratives.py          # POST /api/narratives/
│   ├── events.py              # GET /api/events/
│   ├── commodities.py         # GET /api/commodities/
│   └── impact.py              # POST /api/impact/
└── services/
    ├── gemini_service.py      # Gemini API wrapper
    └── narrative_service.py   # Narrative extraction
```

### Frontend

```
frontend/
├── package.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx
│   ├── api/
│   │   └── client.js          # API client with modules
│   └── hooks/
│       └── useConflictData.js # Data fetching hook
└── .env                        # Environment variables
```

## Configuration

### backend/.env

```
# Required
GEMINI_API_KEY=your_key_here

# Optional
DEBUG=False
LOG_LEVEL=info
```

### frontend/.env

```
# For local development
VITE_API_BASE_URL=http://localhost:8000/api

# For Docker
VITE_API_BASE_URL=http://backend:8000/api

# For production
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Code Snippets

### Use API Client in Frontend

```javascript
import { agentAPI, eventsAPI, commoditiesAPI } from './api/client';

// Query agent
const response = await agentAPI.query("Your question here");
console.log(response.data.data.response);

// Get events
const events = await eventsAPI.getAll(20);
console.log(events.data.data.events);

// Get commodities
const commodities = await commoditiesAPI.getAll();
console.log(commodities.data.data.commodities);
```

### Use Data Hook

```javascript
import useConflictData from './hooks/useConflictData';

function MyComponent() {
  const { events, commodities, loading, errors, refresh } = useConflictData();

  if (loading.events) return <div>Loading events...</div>;
  if (errors.events) return <div>Error: {errors.events}</div>;

  return (
    <div>
      <h2>{events.length} Events</h2>
      {events.map(event => (
        <div key={event.id}>{event.title}</div>
      ))}
      <button onClick={refresh}>Refresh</button>
    </div>
  );
}

export default MyComponent;
```

### Call Backend Endpoint

```python
# In a router file
from fastapi import APIRouter
from services.gemini_service import ask_gemini

router = APIRouter()

@router.post("/myendpoint")
async def my_endpoint(data: dict):
    # Call Gemini
    response = ask_gemini("Your prompt here")
    return {"success": True, "response": response}
```

## Deployment

### Docker Build & Push

```bash
# Build images
docker compose build

# Tag for registry
docker tag gcip_backend:latest registry.example.com/gcip/backend:latest
docker tag gcip_frontend:latest registry.example.com/gcip/frontend:latest

# Push to registry
docker push registry.example.com/gcip/backend:latest
docker push registry.example.com/gcip/frontend:latest
```

### Environment Setup for Production

Create `.env` files with production values:

```bash
# backend/.env (production)
GEMINI_API_KEY=sk-...
DEBUG=False
LOG_LEVEL=warning

# frontend/.env (production)
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Testing

### Run Integration Tests

```bash
bash integration_tests.sh

# Or specify custom URLs
bash integration_tests.sh http://localhost:8000/api http://localhost:5173
```

### Quick Health Check

```bash
# All in one command
curl -s http://localhost:8000/health && \
curl -s http://localhost:8000/api/events/ && \
curl -s http://localhost:5173 && \
echo "✓ All services operational"
```

## Common Tasks

### Add a New Endpoint

1. Create file `backend/routers/myfeature.py`
2. Define router and endpoint
3. Import in `backend/main.py`: `from routers.myfeature import router as myfeature_router`
4. Register in `main.py`: `app.include_router(myfeature_router, prefix="/api")`
5. Test at `http://localhost:8000/api/myfeature/`

### Add a New Frontend Component

1. Create `frontend/src/components/MyComponent.jsx`
2. Use hooks and API client
3. Import in parent component
4. Frontend automatically hot-reloads

### Update Dependencies

**Backend:**
```bash
pip freeze > backend/requirements.txt  # Export current
# Or add to requirements.txt manually
docker compose build  # Rebuild with new deps
```

**Frontend:**
```bash
cd frontend
npm install new-package
# Changes to package.json auto-reload in Docker
```

## Performance Tips

### Speed Up Development

1. **Use .env.local** for local overrides (won't commit)
2. **Check Vite config** — ensure fast refresh is enabled
3. **Monitor logs** — watch for slow queries or API calls
4. **Profile in DevTools** — find bottlenecks

### Speed Up Builds

1. **Cache dependencies** — Docker layer caching
2. **Minimize bundle** — Use vite's built-in optimization
3. **Lazy load routes** — Code split frontend
4. **Database indices** — If using a DB

## Team Communication

### File Structure for Team

```
📦 Conflict_Portal/
├── 🏗️ backend/          # API services (Python/FastAPI)
├── 🎨 frontend/         # UI layer (React/Vite)
├── 🐳 docker-compose.yml
├── 📋 README.md         # Full documentation
├── ✅ INTEGRATION_TESTING.md
└── 📖 QUICK_REFERENCE.md (this file)
```

### Key Contacts

- **Member C (AI/ML Lead)**: Handles Gemini integration, prompt engineering
- **API Documentation**: See `/docs` endpoint
- **Deployment**: See Docker commands above

## Useful Links

- 🔵 Backend: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs
- 🟦 Frontend: http://localhost:5173
- 🌐 Gemini API: https://aistudio.google.com
- 🐳 Docker: https://docs.docker.com

## Final Checklist Before Commit

```bash
# 1. Test local
docker compose down
docker compose up --build

# 2. Run integration tests
bash integration_tests.sh

# 3. Check code style
# (Add linting if needed for your team)

# 4. Verify .env files
ls -la backend/.env frontend/.env

# 5. Commit
git add .
git commit -m "Add: GCIP platform implementation"
git push
```

---

Happy hacking! 🚀 For questions, check the README.md or INTEGRATION_TESTING.md
