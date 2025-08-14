#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
API_HEALTH_CHECK=false
for port in 3000 3001 8080 8000 5000; do
    # Try health check first with timeout
    if curl -s --max-time 3 "http://localhost:${port}/healthcheck" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API server found running on port ${port} (health check)${NC}"
        API_HEALTH_CHECK=true
        break
    fi
    # Fallback: try root endpoint if health check fails
    if curl -s --max-time 3 "http://localhost:${port}/" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API server found running on port ${port} (root endpoint)${NC}"
        API_HEALTH_CHECK=true
        break
    fi
done

if [ "$API_HEALTH_CHECK" = false ]; then
    echo -e "${RED}❌ Error: API server is not accessible on any common port${NC}"
    echo -e "${YELLOW}💡 Please start the API server before running tests${NC}"
    echo -e "${YELLOW}💡 Common ports: 3000, 3001, 8080, 8000, 5000${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="test_outputs"
mkdir -p "$OUTPUT_DIR"

# Timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run fuzzing tests
echo -e "${YELLOW}Running fuzzing tests...${NC}"

# Run pytest and capture output
pytest test_fuzzing.py -q --tb=short --disable-warnings > "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>&1
PYTEST_EXIT_CODE=$?

# Show completion message
echo -e "${GREEN}✅ Fuzzing tests completed!${NC}"
echo ""
echo -e "${BLUE}📁 Output file created:${NC}"
echo "  - Fuzzing tests: $OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log"
echo ""

# Show quick summary of results
echo -e "${BLUE}📊 Quick Results Summary:${NC}"
grep -E "(PASSED|FAILED|SKIPPED)" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" | tail -1

echo ""
echo -e "${YELLOW}💡 To view detailed results:${NC}"
echo "  cat $OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 To view only failures:${NC}"
echo "  grep 'FAILED\|ERROR' $OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log"
