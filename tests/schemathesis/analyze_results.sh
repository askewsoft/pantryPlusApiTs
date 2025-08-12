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

# Find the most recent log file
LATEST_LOG=$(ls -t test_outputs/main_tests_*.log | head -1)
if [ -z "$LATEST_LOG" ]; then
    echo -e "${RED}❌ No test output files found in test_outputs/ directory${NC}"
    exit 1
fi

echo -e "${YELLOW}📊 Analyzing: $LATEST_LOG${NC}"
echo ""

# 1. Basic Statistics
echo -e "${BLUE}📈 BASIC STATISTICS${NC}"
echo "-------------------"
TOTAL_TESTS=$(grep -c "::test_" "$LATEST_LOG")
PASSED=$(grep -c "PASSED" "$LATEST_LOG")
FAILED=$(grep -c "FAILED" "$LATEST_LOG")
SKIPPED=$(grep -c "SKIPPED" "$LATEST_LOG")

echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Skipped: $SKIPPED"
echo "Success Rate: $(( (PASSED * 100) / TOTAL_TESTS ))%"
echo ""

# 2. Failure Analysis
echo -e "${BLUE}❌ FAILURE ANALYSIS${NC}"
echo "-------------------"

if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Found $FAILED failures. Analyzing patterns...${NC}"
    echo ""

    # Common assertion failures
    echo -e "${YELLOW}🔍 Common Assertion Failures:${NC}"
    grep -o "assert.*in.*\[.*\]" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10

    echo ""

    # HTTP status code mismatches
    echo -e "${YELLOW}🔍 HTTP Status Code Issues:${NC}"
    grep -o "Received: [0-9]*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10

    echo ""

    # Endpoint failure distribution
    echo -e "${YELLOW}🔍 Endpoints with Most Failures:${NC}"
    grep -B 2 "FAILED" "$LATEST_LOG" | grep -E "(POST|GET|PUT|DELETE) /v1/" | sort | uniq -c | sort -nr | head -10

    echo ""

    # Error types
    echo -e "${YELLOW}🔍 Common Error Types:${NC}"
    grep -o "Error:.*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr | head -10

else
    echo -e "${GREEN}✅ No failures found!${NC}"
fi

echo ""

# 3. Performance Issues
echo -e "${BLUE}⏱️  PERFORMANCE ISSUES${NC}"
echo "-------------------"
TIMEOUTS=$(grep -c "timeout\|deadline" "$LATEST_LOG" 2>/dev/null || echo "0")
SLOW_TESTS=$(grep -B 1 "took.*ms" "$LATEST_LOG" 2>/dev/null | grep "test_" | wc -l || echo "0")

echo "Timeout/Deadline Issues: $TIMEOUTS"
echo "Slow Tests (>1s): $SLOW_TESTS"

if [ "$SLOW_TESTS" -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}🐌 Slowest Tests:${NC}"
    grep -B 1 "took.*ms" "$LATEST_LOG" | grep "test_" | head -5
fi

echo ""

# 4. Recommendations
echo -e "${BLUE}💡 RECOMMENDATIONS${NC}"
echo "-------------------"

if [ "$FAILED" -gt 0 ]; then
    if grep -q "assert.*in.*\[401, 403\]" "$LATEST_LOG"; then
        echo -e "${YELLOW}⚠️  Authentication Issues Detected:${NC}"
        echo "   - Many tests expect 401/403 but get other status codes"
        echo "   - Check if authentication middleware is working correctly"
        echo "   - Verify error handling for malformed tokens"
    fi

    if grep -q "Received: 500" "$LATEST_LOG"; then
        echo -e "${RED}🚨 Server Errors (500) Detected:${NC}"
        echo "   - API is crashing on some requests"
        echo "   - Check error handling and input validation"
        echo "   - Review server logs for stack traces"
    fi

    if grep -q "Received: 422" "$LATEST_LOG"; then
        echo -e "${YELLOW}⚠️  Validation Errors (422) Detected:${NC}"
        echo "   - Input validation is working (good!)"
        echo "   - Tests may need to adjust expected status codes"
    fi
else
    echo -e "${GREEN}✅ All tests passing! No immediate action needed.${NC}"
fi

echo ""
echo -e "${BLUE}📁 Detailed Analysis Files Created:${NC}"
echo "  - analysis/failures_by_endpoint.txt"
echo "  - analysis/common_errors.txt"
echo "  - analysis/status_code_analysis.txt"

# Create analysis directory
mkdir -p analysis

# Create detailed analysis files
echo "Creating detailed analysis files..."

# Failures by endpoint
grep -B 2 "FAILED" "$LATEST_LOG" | grep -E "(POST|GET|PUT|DELETE) /v1/" | sort | uniq -c | sort -nr > "analysis/failures_by_endpoint.txt"

# Common errors
grep -o "Error:.*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr > "analysis/common_errors.txt"

# Status code analysis
grep -o "Received: [0-9]*" "$LATEST_LOG" 2>/dev/null | sort | uniq -c | sort -nr > "analysis/status_code_analysis.txt"

echo -e "${GREEN}✅ Analysis complete!${NC}"
echo ""
echo -e "${YELLOW}💡 Next Steps:${NC}"
echo "1. Review the recommendations above"
echo "2. Check the detailed analysis files"
echo "3. Focus on the most common failure patterns first"
echo "4. Run targeted tests with: npm run test:schemathesis:auth"
