#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Source .env file if it exists
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
elif [ -f "../.env" ]; then
    export $(grep -v '^#' ../.env | xargs)
fi

# Get API version from command line or prompt user
if [ -z "$1" ]; then
    echo -e "${BLUE}🧪 Schemathesis Property Test Runner${NC}"
    echo "============================================="
    echo -e "${YELLOW}No API version specified. Please choose:${NC}"
    echo "1) v1 (default)"
    echo "2) v2"
    echo "3) Other (custom)"
    echo ""
    read -p "Enter your choice (1-3) or press Enter for v1: " choice

    case $choice in
        2)
            API_VERSION="v2"
            ;;
        3)
            read -p "Enter custom API version (e.g., v3): " API_VERSION
            ;;
        *)
            API_VERSION="v1"
            ;;
    esac
else
    API_VERSION=$1
fi

echo -e "${BLUE}🧪 Running Schemathesis Property Tests${NC}"
echo "============================================="
echo -e "${YELLOW}Target API Version: ${API_VERSION}${NC}"
echo ""

TESTS_DIR='tests/schemathesis'

# Change to schemathesis directory (handle being run from root or scripts directory)
if [ -d "$TESTS_DIR" ]; then
    cd $TESTS_DIR
elif [ -d "../$TESTS_DIR" ]; then
    cd ../$TESTS_DIR
else
    echo -e "${RED}❌ Error: Cannot find $TESTS_DIR directory${NC}"
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

# Timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run property tests
echo -e "${YELLOW}Running property-based tests against ${API_VERSION}...${NC}"

# Run pytest and capture output
APIPORT=$API_PORT pytest test_property_based.py -q --tb=short --disable-warnings --api-version "$API_VERSION" > "$OUTPUT_DIR/property_tests_${API_VERSION}_${TIMESTAMP}.log" 2>&1
PYTEST_EXIT_CODE=$?

# Show completion message
echo -e "${GREEN}✅ Property tests completed for ${API_VERSION}!${NC}"
echo ""
echo -e "${BLUE}📁 Output file created:${NC}"
echo "  - Property tests: $OUTPUT_DIR/property_tests_${API_VERSION}_${TIMESTAMP}.log"
echo ""

# Show quick summary of results
echo -e "${BLUE}📊 Quick Results Summary:${NC}"
grep -E "(PASSED|FAILED|SKIPPED)" "$OUTPUT_DIR/property_tests_${API_VERSION}_${TIMESTAMP}.log" | tail -1

echo ""
echo -e "${YELLOW}💡 To view detailed results:${NC}"
echo "  cat $OUTPUT_DIR/property_tests_${API_VERSION}_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 To view only failures:${NC}"
echo "  grep 'FAILED\|ERROR' $OUTPUT_DIR/property_tests_${API_VERSION}_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 Usage examples:${NC}"
echo "  ./scripts/schemathesis-property.sh v1    # Test v1 API"
echo "  ./scripts/schemathesis-property.sh v2    # Test v2 API"
echo "  ./scripts/schemathesis-property.sh       # Interactive version selection"
