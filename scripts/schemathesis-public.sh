#!/bin/bash

# Run Schemathesis public endpoint tests with quiet output and logging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running Schemathesis Public Endpoint Tests${NC}"
echo "=================================================="

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
    if curl -s "http://localhost:${port}/healthcheck" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API server found running on port ${port}${NC}"
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

# Run public endpoint tests with quiet output
echo -e "${YELLOW}Running public endpoint tests...${NC}"
pytest test_public_endpoints.py -v --tb=short --disable-warnings > "$OUTPUT_DIR/public_tests_${TIMESTAMP}.log" 2>&1

# Generate summary
echo -e "${GREEN}✅ Public endpoint tests completed!${NC}"
echo ""
echo -e "${BLUE}📁 Output file created:${NC}"
echo "  - Public tests: $OUTPUT_DIR/public_tests_${TIMESTAMP}.log"
echo ""

# Show quick summary of results
echo -e "${BLUE}📊 Quick Results Summary:${NC}"
grep -E "(PASSED|FAILED|SKIPPED)" "$OUTPUT_DIR/public_tests_${TIMESTAMP}.log" | tail -1

echo ""
echo -e "${YELLOW}💡 To view detailed results:${NC}"
echo "  cat $OUTPUT_DIR/public_tests_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 To view only failures:${NC}"
echo "  grep -A 5 -B 5 'FAILED\|ERROR' $OUTPUT_DIR/public_tests_${TIMESTAMP}.log"
