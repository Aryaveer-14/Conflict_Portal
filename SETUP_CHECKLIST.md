# GCIP Setup Checklist

Complete this checklist to get your GCIP development environment ready.

## Prerequisites (Do Once)

- [ ] Docker Desktop installed and running
- [ ] Git repository cloned
- [ ] Gemini API key obtained from https://aistudio.google.com (FREE)
- [ ] Text editor or IDE ready (VS Code recommended)

## Environment Setup (Do Once per Machine)

### 1. Create Backend Environment File

```bash
cd ~/Desktop/Conflict_Portal/backend
cp .env.example .env
```

Then edit `backend/.env` and add your Gemini API key:
```
GEMINI_API_KEY=your_actual_key_here
```

- [ ] ✓ backend/.env created
- [ ] ✓ GEMINI_API_KEY added (get free key at https://aistudio.google.com)

### 2. Create Frontend Environment File

```bash
cd ~/Desktop/Conflict_Portal/frontend
cp .env.example .env
```

Default values should work. Only edit if:
- Using local dev (non-Docker): Keep `http://localhost:8000/api`
- Using Docker: Change to `http://backend:8000/api` (already in docker-compose)

- [ ] ✓ frontend/.env created

### 3. Verify Docker Environment

```bash
docker --version
docker compose --version
```

- [ ] ✓ Docker version >= 20.x
- [ ] ✓ Docker Compose version >= 2.x

## First Run (Do This Once)

### 1. Start Services

```bash
cd ~/Desktop/Conflict_Portal
docker compose up --build
```

Wait for these messages:
- `Backend running on http://0.0.0.0:8000` or similar
- `VITE v5.x.x ready in XXX ms`
- No error messages about GEMINI_API_KEY

This takes 2-3 minutes first time (downloading images, installing dependencies).

- [ ] ✓ Both services started successfully
- [ ] ✓ No GEMINI_API_KEY errors
- [ ] ✓ Backend service is healthy

### 2. Test Backend is Working

Open a new terminal:
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status":"ok","service":"GCIP Backend"}
```

- [ ] ✓ Health check returns 200 OK
- [ ] ✓ Response includes correct text

### 3. Test Frontend is Accessible

```bash
curl http://localhost:5173 | head -n 20
```

Should show HTML content (React app).

- [ ] ✓ Frontend responds with HTML
- [ ] ✓ No connection refused error

### 4. Test API Client

Open browser to: http://localhost:8000/docs

You should see:
- Swagger UI interface
- List of endpoints with descriptions
- Try-it-out buttons for each endpoint

- [ ] ✓ Swagger UI loads
- [ ] ✓ All endpoints listed (agent, narratives, events, commodities, impact)
- [ ] ✓ No error messages

## Daily Workflow

### Start of Day

```bash
cd ~/Desktop/Conflict_Portal
docker compose up --build
```

- [ ] Services start without errors
- [ ] Both containers show as healthy
- [ ] No authentication/permission errors

### During Development

Make code changes in:
- `backend/routers/*.py` — Auto-reloads
- `frontend/src/**` — Auto-reloads in browser
- `backend/services/*.py` — Auto-reloads

No manual restart needed! Docker live-reload is enabled.

### Testing an Endpoint

**Option 1: Use Interactive Docs**
1. Open http://localhost:8000/docs
2. Find endpoint
3. Click "Try it out"
4. Enter value
5. Click "Execute"

**Option 2: Use curl**
```bash
curl http://localhost:8000/api/events/
```

**Option 3: Use your IDE's REST client**
- VS Code: REST Client extension
- JetBrains: Built-in REST client

- [ ] ✓ Can test endpoints via /docs
- [ ] ✓ Can test endpoints via curl
- [ ] ✓ Responses are valid JSON

### End of Day

```bash
docker compose down
```

Or just close the terminal (services will continue running).

- [ ] ✓ Services stopped cleanly
- [ ] ✓ No error messages on shutdown

## Troubleshooting During Setup

### "GEMINI_API_KEY not found/invalid"

**Issue**: Backend won't start with Gemini error

**Solution**:
1. Verify key is in `backend/.env` (not `.env.example`)
   ```bash
   grep GEMINI_API_KEY backend/.env
   ```

2. Verify key is valid format (not empty, not wrapped in quotes)
   ```
   ❌ WRONG: GEMINI_API_KEY="abc123"
   ✅ RIGHT: GEMINI_API_KEY=abc123
   ```

3. Get free key: https://aistudio.google.com

4. Rebuild containers:
   ```bash
   docker compose down
   docker compose up --build
   ```

- [ ] ✓ Key is in backend/.env
- [ ] ✓ Key is not quoted
- [ ] ✓ Key is valid format

### "Port 8000/5173 already in use"

**Issue**: "Address already in use" error

**Solution**:
```bash
# On Windows (PowerShell)
Get-Process | Where-Object {$_.Name -like "*node*" -or $_.Name -like "*python*"} | Stop-Process -Force

# On Mac/Linux
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

Then retry:
```bash
docker compose down
docker compose up --build
```

- [ ] ✓ Ports are freed
- [ ] ✓ Services start successfully

### "Docker daemon not running"

**Solution**:
- Open Docker Desktop application
- Wait for it to fully start (usually 30 seconds)
- Retry command

- [ ] ✓ Docker Desktop is running
- [ ] ✓ `docker ps` works in terminal

### Frontend can't reach backend

**Issue**: CORS error or 404 from frontend

**Solution**:
1. Check `frontend/.env`:
   ```bash
   cat frontend/.env
   ```

2. For Docker: Must be `http://backend:8000/api`
   ```bash
   echo "VITE_API_BASE_URL=http://backend:8000/api" > frontend/.env
   ```

3. Rebuild frontend:
   ```bash
   docker compose up --build frontend
   ```

- [ ] ✓ VITE_API_BASE_URL is set
- [ ] ✓ Base URL is correct for your setup
- [ ] ✓ Frontend no longer shows CORS errors

## Integration Testing (Optional but Recommended)

### Run Full Test Suite

```bash
bash integration_tests.sh
```

Should show:
```
🧪 GCIP Integration Test Suite
...
📊 Test Results
✓ Passed: XX
✗ Failed: 0
Success Rate: 100%
```

- [ ] ✓ All tests pass
- [ ] ✓ Success rate is 100%

### Quick Manual Test

```bash
# Test agent endpoint
curl -X POST http://localhost:8000/api/agent/ \
  -H "Content-Type: application/json" \
  -d '{"query":"What is Sudan?","context":""}'

# Response should include success: true and a response string
```

- [ ] ✓ Returns JSON with response
- [ ] ✓ No error messages

## You're Ready When...

- [ ] ✓ Services start with `docker compose up --build`
- [ ] ✓ Backend health check works (`curl http://localhost:8000/health`)
- [ ] ✓ API docs load at http://localhost:8000/docs
- [ ] ✓ Can make at least one API call successfully
- [ ] ✓ Frontend loads at http://localhost:5173
- [ ] ✓ No CORS errors in browser console

## Quick Commands Reference

```bash
# Start everything
docker compose up --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down

# Rebuild from scratch
docker compose down -v
docker compose up --build

# Access running container
docker exec gcip_backend bash
docker exec gcip_frontend bash

# Check if services are healthy
curl http://localhost:8000/health
curl -I http://localhost:5173
```

## Next Steps After Setup

1. ✅ Systems working? Great!
2. Open http://localhost:8000/docs
3. Test each endpoint using "Try it out" button
4. Read [README.md](./README.md) for full documentation
5. Check [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) for commands
6. Review [INTEGRATION_TESTING.md](./INTEGRATION_TESTING.md) for detailed testing

## Getting Help

**Problem**: Still stuck?

**Try these in order**:

1. Read the ERROR MESSAGE in terminal output carefully
2. Check [README.md](./README.md) troubleshooting section
3. Run `bash integration_tests.sh` to verify setup
4. Check Docker logs: `docker compose logs backend`
5. Look at API docs: http://localhost:8000/docs (shows example requests/responses)
6. Ask team member or refer to [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)

---

## Checklist Summary

**Setup Completion**: _____ / 25 items

**Ready to Code?** 
- [ ] YES - All items checked, services running smoothly
- [ ] NO - Go through troubleshooting above

---

*Last Updated: March 12, 2026*  
*GCIP Platform - Hackathon Implementation*
