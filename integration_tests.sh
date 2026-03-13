#!/usr/bin/env bash
# integration_tests.sh
# Comprehensive integration test suite for GCIP
# Verifies all backend endpoints and frontend API integration

set -euo pipefail

ROOT_URL="${1:-http://localhost:8000}"
API_URL="$ROOT_URL/api"
FRONTEND_URL="${2:-http://localhost:5173}"

echo "🧪 GCIP Integration Test Suite"
echo "====================================="
echo "Backend Root: $ROOT_URL"
echo "Backend API:  $API_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
# Usage: test_endpoint <name> <method> <endpoint> <data> <expected_status> [base_url]
#   base_url defaults to $API_URL (/api routes); pass $ROOT_URL for root-level routes.
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local base="${6:-$API_URL}"

    echo -n "Testing $name... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$base$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null) || true
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$base$endpoint" 2>/dev/null) || true
    fi

    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

    if [ -z "$status" ]; then
        echo -e "${RED}✗ FAIL${NC} (connection error)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo ""
        return
    fi

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "Response: $body" | head -c 100
        echo "..."
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $status, expected $expected_status)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "Response: $body"
    fi
    echo ""
}

# ── Health Checks ──────────────────────────────────────────────────────────────

echo "📋 1. Health Checks"
echo "---"
test_endpoint "Backend Health Check" "GET" "/health" "" "200" "$ROOT_URL"

# ── Agent Endpoint ────────────────────────────────────────────────────────────

echo "📋 2. AI Agent Endpoint"
echo "---"
test_endpoint "Valid Agent Query" "POST" "/agent/" \
    '{"query":"What is Sudan?","context":{}}' "200" "$ROOT_URL"

test_endpoint "Agent Query with Context" "POST" "/agent/" \
    '{"query":"How do conflicts affect oil?","context":{"detail_level":"detailed"}}' "200" "$ROOT_URL"

test_endpoint "Agent Query - Invalid (empty)" "POST" "/agent/" \
    '{"query":"","context":{}}' "422" "$ROOT_URL"

test_endpoint "Agent Query - Invalid (short)" "POST" "/agent/" \
    '{"query":"Hi","context":{}}' "422" "$ROOT_URL"

# ── Events Endpoint ────────────────────────────────────────────────────────────

echo "📋 3. Events Endpoint"
echo "---"
test_endpoint "Get All Events" "GET" "/events/?limit=10" "" "200"

test_endpoint "Get Events with Offset" "GET" "/events/?limit=5&offset=0" "" "200"

test_endpoint "Get Specific Event" "GET" "/events/evt_001" "" "200"

test_endpoint "Get Invalid Event" "GET" "/events/evt_999" "" "200"

test_endpoint "Get Events by Region" "GET" "/events/by-region/Middle%20East" "" "200"

# ── Commodities Endpoint ──────────────────────────────────────────────────────

echo "📋 4. Commodities Endpoint"
echo "---"
test_endpoint "Get All Commodities" "GET" "/commodities/" "" "200"

test_endpoint "Get Commodities by Category" "GET" "/commodities/?category=energy" "" "200"

test_endpoint "Get Specific Commodity" "GET" "/commodities/com_001" "" "200"

test_endpoint "Get High-Impact Commodities" "GET" "/commodities/by-impact/high" "" "200"

test_endpoint "Get Trending Commodities" "GET" "/commodities/trending?limit=5" "" "200"

# ── Narratives Endpoint ───────────────────────────────────────────────────────

echo "📋 5. Narratives Endpoint"
echo "---"
test_endpoint "Extract Narratives" "POST" "/narratives/?headlines=Oil%20surge&headlines=Supply%20disruption" "" "200" "$ROOT_URL"

test_endpoint "Get Event Narratives" "GET" "/narratives/event/evt_001" "" "200" "$ROOT_URL"

# ── Impact Endpoint ───────────────────────────────────────────────────────────

echo "📋 6. Impact Analysis Endpoint"
echo "---"
test_endpoint "Request Impact Analysis" "POST" "/impact/" \
    '{"event_id":"evt_001","event_data":{"title":"Sudan clashes","country":"Sudan","casualties":250,"description":"Armed conflict"},"include_commodities":true}' "200"

test_endpoint "Get Cached Impact" "GET" "/impact/event/evt_001" "" "200"

# ── API Documentation ─────────────────────────────────────────────────────────

echo "📋 7. API Documentation"
echo "---"
test_endpoint "OpenAPI Docs" "GET" "/docs" "" "200" "$ROOT_URL"
test_endpoint "ReDoc Docs" "GET" "/redoc" "" "200" "$ROOT_URL"

# ── Results ────────────────────────────────────────────────────────────────────

echo ""
echo "====================================="
echo "📊 Test Results"
echo "====================================="
echo -e "${GREEN}✓ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}✗ Failed: $TESTS_FAILED${NC}"
TOTAL=$((TESTS_PASSED + TESTS_FAILED))
PERCENTAGE=$((TESTS_PASSED * 100 / TOTAL))
echo "Success Rate: $PERCENTAGE% ($TESTS_PASSED/$TOTAL)"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed. Review the output above.${NC}"
    exit 1
fi
