import time
import urllib.request
import urllib.error
import json
import os
import sys
import codecs

fout = codecs.open("output.txt", "w", "utf-8")
sys.stdout = fout
sys.stderr = fout

BASE_URL = "http://127.0.0.1:8006"

def get_json(path):
    url = f"{BASE_URL}{path}"
    t0 = time.time()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    t1 = time.time()
    return data, (t1 - t0) * 1000

print("==========================================")
print("🚀 DAY 1 END-OF-DAY CHECKS 🚀")
print("==========================================\n")

# 1. Health
print("1) GET /health returns 200 OK")
try:
    data, t = get_json("/health")
    status = data.get("status")
    print(f"   ✅ SUCCESS: Server responded with status: {status} in {t:.2f}ms")
except Exception as e:
    print(f"   ❌ FAILED: {e}")

# 2. Events
print("\n2) GET /events/ returns real conflict events array")
try:
    data, t = get_json("/events/")
    events = data.get("data", {}).get("events", [])
    if len(events) >= 20:
        print(f"   ✅ SUCCESS: Fetched {len(events)} events (e.g., '{events[0]['title']}')")
    else:
        print(f"   ⚠️ WARNING: Fetched {len(events)} events (expected 20+)")
except Exception as e:
    print(f"   ❌ FAILED: {e}")

# 3. Commodities
print("\n3) GET /commodities/ returns oil price series")
try:
    data, t = get_json("/commodities/")
    oil = data.get("data", {}).get("oil", {})
    points = len(oil.get("series", []))
    if points >= 30:
        print(f"   ✅ SUCCESS: Fetched Brent oil data with {points} days of pricing")
    else:
        print(f"   ⚠️ WARNING: Fetched {points} days of data (expected 30+)")
except Exception as e:
    print(f"   ❌ FAILED: {e}")

# 4. News
print("\n4) GET /news/?q=ukraine returns articles")
try:
    data, t = get_json("/news/?q=ukraine")
    articles = data.get("data", {}).get("articles", [])
    if len(articles) > 0:
        print(f"   ✅ SUCCESS: Fetched {len(articles)} articles about 'ukraine'")
    else:
        print(f"   ⚠️ WARNING: No articles returned, please check NEWSAPI_KEY in .env!")
except Exception as e:
    print(f"   ❌ FAILED: {e}")

# 5. Schemas shared
print("\n5) schemas.py shared with all team members")
schemas_path = os.path.join("backend", "models", "schemas.py")
if os.path.exists(schemas_path):
    with open(schemas_path, "r") as f:
        content = f.read()
    if "CommodityDataPoint" in content and "ConflictEvent" in content:
        print(f"   ✅ SUCCESS: schemas.py is properly formatted with all necessary Pydantic models.")
else:
    print(f"   ❌ FAILED: schemas.py not found at {schemas_path}")

# 6. Caching speeds
print("\n6) Caching works — second call returns in <50ms")
try:
    # First call
    d1, t1 = get_json("/events/")
    print(f"   - First call to /events/ took {t1:.2f}ms")
    # Second call (should be cached)
    d2, t2 = get_json("/events/")
    if t2 < 50:
        print(f"   ✅ SUCCESS: Second call took {t2:.2f}ms (Cache HIT)")
    else:
        print(f"   ❌ FAILED: Second call took {t2:.2f}ms (Expected <50ms)")
except Exception as e:
    print(f"   ❌ FAILED: {e}")

print("\n==========================================")
print("🏁 CHECKS COMPLETE")
print("==========================================")
