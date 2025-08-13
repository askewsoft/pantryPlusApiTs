#!/bin/bash

# Run Schemathesis fuzzing tests with quiet output and logging

set -e

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

# Create output directory
OUTPUT_DIR="test_outputs"
mkdir -p "$OUTPUT_DIR"

# Timestamp for unique filenames
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Run fuzzing tests with progress monitoring
echo -e "${YELLOW}Running security fuzzing tests...${NC}"

# Start pytest in background and capture PID
pytest test_fuzzing.py -v --tb=short --disable-warnings > "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>&1 &
PYTEST_PID=$!

# Monitor progress
echo -e "${BLUE}📊 Progress monitoring started...${NC}"
LAST_PROGRESS=0
INITIAL_CHECK=true

while kill -0 $PYTEST_PID 2>/dev/null; do
    sleep 2  # Check every 2 seconds for faster updates

    # Count completed tests
    COMPLETED=$(grep -c "PASSED\|FAILED\|SKIPPED" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null || echo "0")

    # Estimate total tests (this is approximate)
    TOTAL_ESTIMATE=$(grep -c "::test_" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null || echo "0")

    if [ "$TOTAL_ESTIMATE" -gt 0 ] && [ "$COMPLETED" -gt 0 ]; then
        PROGRESS=$(( (COMPLETED * 100) / TOTAL_ESTIMATE ))

        # Show initial progress immediately
        if [ "$INITIAL_CHECK" = true ]; then
            echo -e "${YELLOW}📊 Initial Progress: ${PROGRESS}% (${COMPLETED}/${TOTAL_ESTIMATE} tests completed)${NC}"
            INITIAL_CHECK=false
            LAST_PROGRESS=$PROGRESS
        # Show progress every 5% for more granular updates
        elif [ $PROGRESS -gt $LAST_PROGRESS ] && [ $((PROGRESS % 5)) -eq 0 ]; then
            echo -e "${GREEN}📈 Progress: ${PROGRESS}% (${COMPLETED}/${TOTAL_ESTIMATE} tests completed)${NC}"
            LAST_PROGRESS=$PROGRESS
        fi

        # Show 100% completion immediately
        if [ $PROGRESS -eq 100 ]; then
            echo -e "${GREEN}🎉 All tests completed!${NC}"
            break  # Exit the monitoring loop
        fi
    fi
done

# Wait for pytest to finish
wait $PYTEST_PID
PYTEST_EXIT_CODE=$?

# Final progress update
FINAL_COMPLETED=$(grep -c "PASSED\|FAILED\|SKIPPED" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null || echo "0")
FINAL_TOTAL=$(grep -c "::test_" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null || echo "0")

if [ "$FINAL_TOTAL" -gt 0 ]; then
    echo -e "${GREEN}📈 Final Progress: 100% (${FINAL_COMPLETED}/${FINAL_TOTAL} tests completed)${NC}"
fi

echo -e "${GREEN}✅ Fuzzing tests completed!${NC}"

# Generate summary
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
echo "  grep -A 5 -B 5 'FAILED\|ERROR' $OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log"
