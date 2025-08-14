#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Source .env file if it exists
if [ -f ".env" ]; then
    set -a
    source .env
    set +a
elif [ -f "../.env" ]; then
    set -a
    source ../.env
    set +a
fi

echo -e "${BLUE}🧪 Running Schemathesis Fuzzing Tests${NC}"
echo "============================================="

# Change to schemathesis directory (handle being run from root or scripts directory)
if [ -d "tests/schemathesis" ]; then
    cd tests/schemathesis
elif [ -d "../tests/schemathesis" ]; then
    cd ../tests/schemathesis
else
    echo -e "${RED}❌ Error: Cannot find tests/schemathesis directory${NC}"
    exit 1
fi

# Check if API server is accessible
echo -e "${BLUE}🔍 Checking API server accessibility...${NC}"

# Get port from environment variable
if [ -z "$APIPORT" ]; then
    echo -e "${RED}❌ Error: APIPORT environment variable is required but not set${NC}"
    echo -e "${YELLOW}💡 Please set APIPORT environment variable before running tests${NC}"
    exit 1
fi

API_PORT=$APIPORT
echo -e "${BLUE}🔍 Using API port: ${API_PORT} (from APIPORT env var)${NC}"

# Check if API server is accessible on the configured port
if curl -s --max-time 3 "http://localhost:${API_PORT}/healthcheck" >/dev/null 2>&1; then
    echo -e "${GREEN}✅ API server found running on port ${API_PORT} (health check)${NC}"
else
    echo -e "${RED}❌ Error: API server is not accessible on port ${API_PORT}${NC}"
    echo -e "${YELLOW}💡 Please start the API server on port ${API_PORT} before running tests${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="test_outputs"
mkdir -p "$OUTPUT_DIR"

# Path from project root to test outputs (for user instructions)
ROOT_TO_OUTPUTS="tests/schemathesis/test_outputs"

# Timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run fuzzing tests
echo -e "${YELLOW}Running fuzzing tests against ${API_VERSION}...${NC}"

# Run pytest and capture output
APIPORT=$API_PORT pytest test_fuzzing.py -q --tb=short --disable-warnings --api-version "$API_VERSION" > "$OUTPUT_DIR/fuzzing_tests_${API_VERSION}_${TIMESTAMP}.log" 2>&1
PYTEST_EXIT_CODE=$?

# Show completion message
echo -e "${GREEN}✅ Fuzzing tests completed for ${API_VERSION}!${NC}"
echo ""
echo -e "${BLUE}📁 Output file created:${NC}"
echo "  - Fuzzing tests: $ROOT_TO_OUTPUTS/fuzzing_tests_${API_VERSION}_${TIMESTAMP}.log"
echo ""

# Show quick summary of results
echo -e "${BLUE}📊 Quick Results Summary:${NC}"
grep -E "(PASSED|FAILED|SKIPPED)" "$OUTPUT_DIR/fuzzing_tests_${API_VERSION}_${TIMESTAMP}.log" | tail -1

echo ""
echo -e "${YELLOW}💡 To view detailed results:${NC}"
echo "  cat $ROOT_TO_OUTPUTS/fuzzing_tests_${API_VERSION}_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 To view only failures:${NC}"
echo "  grep 'FAILED\|ERROR' $ROOT_TO_OUTPUTS/fuzzing_tests_${API_VERSION}_${TIMESTAMP}.log"
