#!/bin/bash

# Test Results Analyzer
# This script analyzes Schemathesis test output files to find common patterns

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 SCHEMATHEISIS TEST RESULTS ANALYZER${NC}"
echo "=============================================="

# Find the most recent log file (check multiple types)
LATEST_LOG=""
if [ -d "test_outputs" ]; then
    TEST_OUTPUTS_DIR="test_outputs"
elif [ -d "tests/schemathesis/test_outputs" ]; then
    TEST_OUTPUTS_DIR="tests/schemathesis/test_outputs"
elif [ -d "../tests/schemathesis/test_outputs" ]; then
    TEST_OUTPUTS_DIR="../tests/schemathesis/test_outputs"
else
    echo -e "${RED}❌ Error: Cannot find test_outputs directory${NC}"
    echo "Current directory: $(pwd)"
    echo "Available directories:"
    ls -la
    exit 1
fi

echo -e "${BLUE}📁 Using test outputs directory: $TEST_OUTPUTS_DIR${NC}"

for pattern in "property_tests_*.log" "fuzzing_tests_*.log" "all_tests_*.log" "public_tests_*.log"; do
    LATEST_LOG=$(ls -t $TEST_OUTPUTS_DIR/$pattern 2>/dev/null | head -1)
    if [ -n "$LATEST_LOG" ]; then
        break
    fi
done

if [ -z "$LATEST_LOG" ]; then
    echo -e "${YELLOW}⚠️  No test output files found in $TEST_OUTPUTS_DIR directory${NC}"
    echo ""
    echo -e "${BLUE}💡 To generate log files for analysis:${NC}"
    echo "   npm run test:schemathesis:property    # Run property tests (generates logs)"
    echo "   npm run test:schemathesis:fuzzing     # Run fuzzing tests (generates logs)"
    echo "   npm run test:schemathesis:public      # Run public tests (generates logs)"
    echo "   npm run test:schemathesis             # Run all tests (generates logs)"
    echo ""
    echo -e "${YELLOW}Note: All test types now generate log files for analysis.${NC}"
    exit 0
fi

echo -e "${YELLOW}📊 Analyzing: $LATEST_LOG${NC}"
echo ""

# 1. Basic Statistics
echo -e "${BLUE}📈 BASIC STATISTICS${NC}"
echo "-------------------"

# Get the final summary from pytest output (most accurate)
FINAL_SUMMARY=$(grep "====.*failed.*passed.*skipped.*====" "$LATEST_LOG" | tail -1)

if [ -n "$FINAL_SUMMARY" ]; then
    # Extract numbers from final summary: "==== 50 failed, 127 passed, 24 skipped ===="
    FAILED=$(echo "$FINAL_SUMMARY" | grep -o "[0-9]* failed" | grep -o "[0-9]*" | tr -d '\n' || echo "0")
    PASSED=$(echo "$FINAL_SUMMARY" | grep -o "[0-9]* passed" | grep -o "[0-9]*" | tr -d '\n' || echo "0")
    SKIPPED=$(echo "$FINAL_SUMMARY" | grep -o "[0-9]* skipped" | grep -o "[0-9]*" | tr -d '\n' || echo "0")
    TOTAL_TESTS=$((FAILED + PASSED + SKIPPED))

    echo "Total Tests: $TOTAL_TESTS (from final summary)"
else
    # Fallback to counting individual test results (less accurate)
    TOTAL_TESTS=$(grep -c "::test_" "$LATEST_LOG" 2>/dev/null | tr -d '\n' || echo "0")
    PASSED=$(grep -c "PASSED" "$LATEST_LOG" 2>/dev/null | tr -d '\n' || echo "0")
    FAILED=$(grep -c "FAILED" "$LATEST_LOG" 2>/dev/null | tr -d '\n' || echo "0")
    SKIPPED=$(grep -c "SKIPPED" "$LATEST_LOG" 2>/dev/null | tr -d '\n' || echo "0")

    echo "Total Tests: $TOTAL_TESTS (estimated from individual results)"
fi

if [ "$PASSED" -gt 0 ]; then
    echo -e "${GREEN}✅ Passed: $PASSED${NC}"
fi

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAILED${NC}"
fi

if [ "$SKIPPED" -gt 0 ]; then
    echo -e "${YELLOW}⚠️ Skipped: $SKIPPED${NC}"
fi

if [ "$TOTAL_TESTS" -gt 0 ]; then
    echo "Success Rate: $(( (PASSED * 100) / TOTAL_TESTS ))%"
else
    echo "Success Rate: N/A (no tests found)"
fi
echo ""

# 2. Failure Analysis (only show if there are failures)
if [ "$FAILED" -gt 0 ]; then
    echo -e "${BLUE}❌ FAILURE ANALYSIS${NC}"
    echo "-------------------"
    echo -e "${RED}Found $FAILED failures. Analyzing patterns...${NC}"
    echo ""

    # Common assertion failures (avoid duplicates)
    echo -e "${YELLOW}🔍 Common Assertion Failures:${NC}"
    grep -o "assert.*in.*\[.*\]" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10

    echo ""

    # HTTP status code mismatches (avoid duplicates)
    echo -e "${YELLOW}🔍 HTTP Status Code Issues:${NC}"
    grep -o "Received: [0-9]*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10

    echo ""

    # Endpoint failure distribution (count unique test failures, not individual lines)
    echo -e "${YELLOW}🔍 Endpoints with Most Failures:${NC}"
    # Extract unique test names that failed, avoiding duplicate counting
    grep "FAILED" "$LATEST_LOG" | grep "::test_" | sed 's/.*::test_\([^[]*\).*/\1/' | sort | uniq -c | sort -nr | head -10

    echo ""

    # Error types (avoid duplicates)
    echo -e "${YELLOW}🔍 Common Error Types:${NC}"
    grep -o "Error:.*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10

    echo ""
fi

# 3. Performance Issues (only show if there are issues)
TIMEOUTS=$(grep -c "timeout\|deadline" "$LATEST_LOG" 2>/dev/null | tr -d '\n' || echo "0")
SLOW_TESTS=$(grep -B 1 "took.*ms" "$LATEST_LOG" 2>/dev/null | grep "test_" | wc -l | tr -d '\n' || echo "0")

if [ "$TIMEOUTS" -gt 0 ] || [ "$SLOW_TESTS" -gt 0 ]; then
    echo -e "${BLUE}⏱️  PERFORMANCE ISSUES${NC}"
    echo "-------------------"

    if [ "$TIMEOUTS" -gt 0 ]; then
        echo "Timeout/Deadline Issues: $TIMEOUTS"
    fi

    if [ "$SLOW_TESTS" -gt 0 ]; then
        echo "Slow Tests (>1s): $SLOW_TESTS"
        echo ""
        echo -e "${YELLOW}🐌 Slowest Tests:${NC}"
        grep -B 1 "took.*ms" "$LATEST_LOG" | grep "test_" | head -5
    fi

    echo ""
fi

# 4. Recommendations (only show if there are issues)
if [ "$FAILED" -gt 0 ]; then
    echo -e "${BLUE}💡 RECOMMENDATIONS${NC}"
    echo "-------------------"

    if grep -q "assert.*in.*\[401, 403\]" "$LATEST_LOG"; then
        echo -e "${YELLOW}⚠️  Authentication Issues Detected:${NC}"
        echo "   - Many tests expect 401/403 but get other status codes"
        echo "   - Check if authentication middleware is working correctly"
        echo "   - Verify error handling for malformed tokens"
        echo ""
    fi

    if grep -q "Received: 500" "$LATEST_LOG"; then
        echo -e "${RED}🚨 Server Errors (500) Detected:${NC}"
        echo "   - API is crashing on some requests"
        echo "   - Check error handling and input validation"
        echo "   - Review server logs for stack traces"
        echo ""
    fi

    if grep -q "Received: 422" "$LATEST_LOG"; then
        echo -e "${YELLOW}⚠️  Validation Errors (422) Detected:${NC}"
        echo "   - Input validation is working (good!)"
        echo "   - Tests may need to adjust expected status codes"
        echo ""
    fi
fi

# Only create analysis files if there are failures
if [ "$FAILED" -gt 0 ]; then
    echo ""
    echo -e "${BLUE}📁 Detailed Analysis Files Created:${NC}"

    # Create analysis directory
    mkdir -p analysis

    # Failures by endpoint
    grep -B 2 "FAILED" "$LATEST_LOG" | grep -E "(POST|GET|PUT|DELETE) /v1/" | sort | uniq -c | sort -nr > "analysis/failures_by_endpoint.txt"
    echo "  - analysis/failures_by_endpoint.txt"

    # Common errors
    grep -o "Error:.*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr > "analysis/common_errors.txt"
    echo "  - analysis/common_errors.txt"

    # Status code analysis
    grep -o "Received: [0-9]*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr > "analysis/status_code_analysis.txt"
    echo "  - analysis/status_code_analysis.txt"

    echo -e "${GREEN}✅ Analysis complete!${NC}"
fi
