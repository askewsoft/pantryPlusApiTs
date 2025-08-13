#!/bin/bash

# Run all Schemathesis tests with quiet output and logging

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running All Schemathesis Tests${NC}"
echo "====================================="

# Change to schemathesis directory (handle being run from root or scripts directory)
if [ -d "tests/schemathesis" ]; then
    cd tests/schemathesis
elif [ -d "../tests/schemathesis" ]; then
    cd ../tests/schemathesis
else
    echo -e "${RED}❌ Error: Cannot find tests/schemathesis directory${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="test_outputs"
mkdir -p "$OUTPUT_DIR"

# Timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run all tests with quiet output
echo -e "${YELLOW}Running all tests...${NC}"
pytest --tb=short --disable-warnings > "$OUTPUT_DIR/all_tests_${TIMESTAMP}.log" 2>&1

# Generate summary
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo -e "${BLUE}📁 Output file created:${NC}"
echo "  - All tests: $OUTPUT_DIR/all_tests_${TIMESTAMP}.log"
echo ""

# Show quick summary of results
echo -e "${BLUE}📊 Quick Results Summary:${NC}"
grep -E "(PASSED|FAILED|SKIPPED)" "$OUTPUT_DIR/all_tests_${TIMESTAMP}.log" | tail -1

echo ""
echo -e "${YELLOW}💡 To view detailed results:${NC}"
echo "  cat $OUTPUT_DIR/all_tests_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 To view only failures:${NC}"
echo "  grep -A 5 -B 5 'FAILED\|ERROR' $OUTPUT_DIR/all_tests_${TIMESTAMP}.log"
