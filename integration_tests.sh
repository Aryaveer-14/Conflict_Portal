#!/usr/bin/env bash
# integration_tests.sh
# Comprehensive integration test suite for GCIP
# Verifies all backend endpoints and frontend API integration

set -e

BASE_URL="${1:-http://localhost:8000/api}"
FRONTEND_URL="${2:-http://localhost:5173}"
# Root server URL (without /api prefix) used for documentation endpoints
ROOT_URL="${BASE_URL%/api}"

echo "🧪 GCIP Integration Test Suite"
echo "====================================="
echo "Backend API: $BASE_URL"
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
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5

    echo -n "Testing $name... "

    if [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    else
        response=$(curl -s -w "\n%{http_code}" -X GET "$BASE_URL$endpoint")
    fi

    status=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)

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

# Test function for full URLs (not prefixed with BASE_URL)
test_url() {
    local name=$1
    local url=$2
    local expected_status=$3

    echo -n "Testing $name... "

    status=$(curl -s -o /dev/null -w "%{http_code}" "$url")

    if [ "$status" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $status)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $status, expected $expected_status)"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# ── Health Checks ──────────────────────────────────────────────────────────────

echo "📋 1. Health Checks"
echo "---"
test_endpoint "Backend Health Check" "GET" "/health" "" "200"

# ── Agent Endpoint ────────────────────────────────────────────────────────────

echo "📋 2. AI Agent Endpoint"
echo "---"
test_endpoint "Valid Agent Query" "POST" "/agent/" \
    '{"query":"What is Sudan?","context":""}' "200"

test_endpoint "Agent Query with Context" "POST" "/agent/" \
    '{"query":"How do conflicts affect oil?","context":"Focus on crude prices"}' "200"

test_endpoint "Agent Query - Invalid (empty)" "POST" "/agent/" \
    '{"query":"","context":""}' "422"

test_endpoint "Agent Query - Invalid (short)" "POST" "/agent/" \
    '{"query":"Hi","context":""}' "422"

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
test_endpoint "Extract Narratives" "POST" "/narratives/?headlines=Oil%20surge&headlines=Supply%20disruption" "" "200"

test_endpoint "Get Event Narratives" "GET" "/narratives/event/evt_001" "" "200"

# ── Impact Endpoint ───────────────────────────────────────────────────────────

echo "📋 6. Impact Analysis Endpoint"
echo "---"
test_endpoint "Request Impact Analysis" "POST" "/impact/" \
    '{"event_id":"evt_001","event_data":{"title":"Sudan clashes","country":"Sudan","casualties":250,"description":"Armed conflict"},"include_commodities":true}' "200"

test_endpoint "Get Cached Impact" "GET" "/impact/event/evt_001" "" "200"

# ── API Documentation ─────────────────────────────────────────────────────────

echo "📋 7. API Documentation"
echo "---"
test_url "OpenAPI Docs" "$ROOT_URL/docs" "200"
test_url "ReDoc Docs" "$ROOT_URL/redoc" "200"

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
