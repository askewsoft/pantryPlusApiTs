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

# Run fuzzing tests with progress monitoring
echo -e "${YELLOW}Running security fuzzing tests...${NC}"

# Start pytest in background and capture PID
pytest test_fuzzing.py -v --tb=short --disable-warnings > "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>&1 &
PYTEST_PID=$!

# Monitor progress
echo -e "${BLUE}📊 Progress monitoring started...${NC}"
LAST_PROGRESS=0
LAST_COMPLETED=0
INITIAL_CHECK=true
COMPLETION_DETECTED=false

while kill -0 $PYTEST_PID 2>/dev/null; do
    sleep 2  # Check every 2 seconds for faster updates

    # Count completed tests - look for the actual test result lines
    # Try multiple patterns to catch different pytest output formats
    COMPLETED=$(grep -c "PASSED\|FAILED\|SKIPPED\|ERROR" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null | tr -d '\n' || echo "0")

    # If no results found with standard patterns, try alternative counting
    if [ "$COMPLETED" -eq 0 ]; then
        # Count lines that look like test results (contain test names and status)
        COMPLETED=$(grep -c "test_.*::.*\[.*%\]" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null | tr -d '\n' || echo "0")
    fi

    # Get total tests from the "collected X items" line
    TOTAL_ESTIMATE=$(grep "collected.*items" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" | grep -o "[0-9]\+" | head -1 | tr -d '\n' || echo "0")

    # Debug output (only show occasionally to avoid spam)
    if [ $((RANDOM % 10)) -eq 0 ]; then
        echo -e "${BLUE}🔍 Debug: Found ${COMPLETED} completed tests, total estimated: ${TOTAL_ESTIMATE}${NC}"
    fi

    # Only show progress if we have both a total and completed count, and the count is stable
    if [ "$TOTAL_ESTIMATE" -gt 0 ] && [ "$COMPLETED" -gt 0 ] && [ "$COMPLETED" -ge "$LAST_COMPLETED" ]; then
        LAST_COMPLETED=$COMPLETED
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

        # Check for completion - if we're at 100% and pytest is finishing
        if [ $PROGRESS -eq 100 ] && [ "$COMPLETION_DETECTED" = false ]; then
            echo -e "${GREEN}🎉 All tests completed!${NC}"
            COMPLETION_DETECTED=true

            # Give pytest a moment to finish writing output, then check if it's done
            sleep 1
            if ! kill -0 $PYTEST_PID 2>/dev/null; then
                break  # pytest has finished, exit monitoring
            fi
        fi
    fi

    # Alternative completion detection: if we haven't seen new test results in a while
    if [ "$COMPLETED" -gt 0 ] && [ "$COMPLETED" -eq "$LAST_COMPLETED" ] && [ "$COMPLETED" -gt 20 ]; then
        # Check if pytest is still running but we haven't seen new results
        if kill -0 $PYTEST_PID 2>/dev/null; then
            # Wait a bit longer to see if more results come in
            sleep 5
            # Try multiple patterns to catch different pytest output formats
            NEW_COMPLETED=$(grep -c "PASSED\|FAILED\|SKIPPED\|ERROR" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null | tr -d '\n' || echo "0")

            # If no results found with standard patterns, try alternative counting
            if [ "$NEW_COMPLETED" -eq 0 ]; then
                # Count lines that look like test results (contain test names and status)
                NEW_COMPLETED=$(grep -c "test_.*::.*\[.*%\]" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null | tr -d '\n' || echo "0")
            fi

            if [ "$NEW_COMPLETED" -eq "$COMPLETED" ]; then
                echo -e "${YELLOW}⚠️  No new test results detected for 5 seconds, tests may be stuck or complete${NC}"
                # Don't break here, just continue monitoring
            fi
        fi
    fi
done

# Wait for pytest to finish (should be quick if we detected completion)
if kill -0 $PYTEST_PID 2>/dev/null; then
    echo -e "${YELLOW}⏳ Waiting for pytest to finish...${NC}"
    wait $PYTEST_PID
fi
PYTEST_EXIT_CODE=$?

# Final progress update
# Try multiple patterns to catch different pytest output formats
FINAL_COMPLETED=$(grep -c "PASSED\|FAILED\|SKIPPED\|ERROR" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null | tr -d '\n' || echo "0")

# If no results found with standard patterns, try alternative counting
if [ "$FINAL_COMPLETED" -eq 0 ]; then
    # Count lines that look like test results (contain test names and status)
    FINAL_COMPLETED=$(grep -c "test_.*::.*\[.*%\]" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" 2>/dev/null | tr -d '\n' || echo "0")
fi

FINAL_TOTAL=$(grep "collected.*items" "$OUTPUT_DIR/fuzzing_tests_${TIMESTAMP}.log" | grep -o "[0-9]\+" | head -1 | tr -d '\n' || echo "0")

if [ "$FINAL_TOTAL" -gt 0 ]; then
    echo -e "${GREEN}📈 Final Progress: 100% (${FINAL_COMPLETED}/${FINAL_TOTAL} tests completed)${NC}"
fi

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
