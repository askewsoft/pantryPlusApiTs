#!/bin/bash

# Run Schemathesis tests with quiet output
# This script reduces console noise by redirecting output to files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running Schemathesis Tests (Quiet Mode)${NC}"
echo "=================================================="

# Change to schemathesis directory
cd ../tests/schemathesis

# Create output directory
OUTPUT_DIR="test_outputs"
mkdir -p "$OUTPUT_DIR"

# Timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run tests with different verbosity levels
echo -e "${YELLOW}Running basic tests...${NC}"
pytest test_property_based.py::test_configuration_summary -v > "$OUTPUT_DIR/config_${TIMESTAMP}.log" 2>&1

echo -e "${YELLOW}Running main test suite...${NC}"
pytest test_property_based.py -v --tb=short --disable-warnings > "$OUTPUT_DIR/main_tests_${TIMESTAMP}.log" 2>&1

echo -e "${YELLOW}Running fuzzing tests...${NC}"
pytest test_fuzzing.py -v --tb=short --disable-warnings > "$OUTPUT_DIR/fuzzing_${TIMESTAMP}.log" 2>&1

# Generate summary
echo -e "${GREEN}✅ Tests completed!${NC}"
echo ""
echo -e "${BLUE}📁 Output files created:${NC}"
echo "  - Configuration: $OUTPUT_DIR/config_${TIMESTAMP}.log"
echo "  - Main tests: $OUTPUT_DIR/main_tests_${TIMESTAMP}.log"
echo "  - Fuzzing: $OUTPUT_DIR/fuzzing_${TIMESTAMP}.log"
echo ""

# Show quick summary of results
echo -e "${BLUE}📊 Quick Results Summary:${NC}"
echo "Main tests:"
grep -E "(PASSED|FAILED|SKIPPED)" "$OUTPUT_DIR/main_tests_${TIMESTAMP}.log" | tail -1

echo ""
echo -e "${YELLOW}💡 To view detailed results:${NC}"
echo "  cat $OUTPUT_DIR/main_tests_${TIMESTAMP}.log"
echo "  cat $OUTPUT_DIR/fuzzing_${TIMESTAMP}.log"
echo ""
echo -e "${YELLOW}💡 To view only failures:${NC}"
echo "  grep -A 5 -B 5 'FAILED\|ERROR' $OUTPUT_DIR/main_tests_${TIMESTAMP}.log"
