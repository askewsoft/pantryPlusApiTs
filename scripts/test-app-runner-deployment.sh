#!/bin/bash

# App Runner Deployment Testing Script
# This script verifies that the App Runner deployment is working correctly

set -e

# Configuration
AWS_REGION=${AWS_REGION:-us-east-1}
APP_RUNNER_SERVICE_NAME="pantryplus-api-service"
TEST_TIMEOUT=300  # 5 minutes timeout for service to be ready

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check if curl is installed for API testing
    if ! command -v curl &> /dev/null; then
        error "curl is not installed. Please install it first."
    fi
    
    # Check if jq is installed for JSON parsing
    if ! command -v jq &> /dev/null; then
        error "jq is not installed. Please install it first."
    fi
    
    log "Prerequisites check passed"
}

# Get App Runner service URL
get_service_url() {
    log "Getting App Runner service URL..."
    
    # Wait for service to be ready
    local start_time=$(date +%s)
    local service_url=""
    
    while [ $(($(date +%s) - start_time)) -lt $TEST_TIMEOUT ]; do
        if aws apprunner describe-service --service-name "$APP_RUNNER_SERVICE_NAME" --region "$AWS_REGION" 2>/dev/null; then
            service_url=$(aws apprunner describe-service \
                --service-name "$APP_RUNNER_SERVICE_NAME" \
                --region "$AWS_REGION" \
                --query 'Service.ServiceUrl' \
                --output text)
            
            if [ "$service_url" != "None" ] && [ -n "$service_url" ]; then
                log "Service URL: $service_url"
                echo "$service_url"
                return 0
            fi
        fi
        
        log "Waiting for service to be ready... (timeout in $((TEST_TIMEOUT - $(($(date +%s) - start_time)))) seconds"
        sleep 10
    done
    
    error "Service did not become ready within $TEST_TIMEOUT seconds"
}

# Test health check endpoint
test_health_check() {
    local service_url=$1
    
    log "Testing health check endpoint..."
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/health_response.json "https://$service_url/healthcheck")
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        log "✅ Health check passed (HTTP $status_code)"
        cat /tmp/health_response.json
        echo
    else
        error "❌ Health check failed (HTTP $status_code)"
    fi
}

# Test API documentation endpoint
test_api_docs() {
    local service_url=$1
    
    log "Testing API documentation endpoint..."
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/docs_response.html "https://$service_url/v1/docs")
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        log "✅ API documentation accessible (HTTP $status_code)"
    else
        warn "⚠️  API documentation not accessible (HTTP $status_code)"
    fi
}

# Test Swagger JSON endpoint
test_swagger_json() {
    local service_url=$1
    
    log "Testing Swagger JSON endpoint..."
    
    local response=$(curl -s -w "%{http_code}" -o /tmp/swagger_response.json "https://$service_url/v1/swagger.json")
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        log "✅ Swagger JSON accessible (HTTP $status_code)"
        
        # Validate JSON structure
        if jq empty /tmp/swagger_response.json 2>/dev/null; then
            log "✅ Swagger JSON is valid"
            
            # Check for expected endpoints
            local endpoint_count=$(jq '.paths | length' /tmp/swagger_response.json)
            log "Found $endpoint_count API endpoints"
        else
            warn "⚠️  Swagger JSON is not valid JSON"
        fi
    else
        warn "⚠️  Swagger JSON not accessible (HTTP $status_code)"
    fi
}

# Test database connectivity (indirectly)
test_database_connectivity() {
    local service_url=$1
    
    log "Testing database connectivity (via API endpoints)..."
    
    # Try to access an endpoint that requires database access
    # This will fail with a proper error if DB is not connected
    local response=$(curl -s -w "%{http_code}" -o /tmp/db_test_response.json "https://$service_url/v1/shoppers")
    local status_code=${response: -3}
    
    if [ "$status_code" = "401" ]; then
        log "✅ Database connectivity confirmed (got expected 401 for unauthenticated request)"
    elif [ "$status_code" = "500" ]; then
        error "❌ Database connectivity issue (HTTP 500 - likely DB connection failed)"
    else
        warn "⚠️  Unexpected response (HTTP $status_code) - check logs for DB connectivity"
    fi
}

# Check CloudWatch logs
check_cloudwatch_logs() {
    log "Checking CloudWatch logs..."
    
    # Get log group name
    local log_group_name="/aws/apprunner/$APP_RUNNER_SERVICE_NAME"
    
    # Check if log group exists
    if aws logs describe-log-groups --log-group-name-prefix "$log_group_name" --region "$AWS_REGION" 2>/dev/null | jq -e '.logGroups | length > 0' > /dev/null; then
        log "✅ CloudWatch log group exists: $log_group_name"
        
        # Get recent log events
        local log_streams=$(aws logs describe-log-streams \
            --log-group-name "$log_group_name" \
            --order-by LastEventTime \
            --descending \
            --max-items 1 \
            --region "$AWS_REGION" \
            --query 'logStreams[0].logStreamName' \
            --output text)
        
        if [ "$log_streams" != "None" ] && [ -n "$log_streams" ]; then
            log "Recent logs from stream: $log_streams"
            aws logs get-log-events \
                --log-group-name "$log_group_name" \
                --log-stream-name "$log_streams" \
                --start-from-head \
                --limit 10 \
                --region "$AWS_REGION" \
                --query 'events[*].message' \
                --output text | head -20
        fi
    else
        warn "⚠️  CloudWatch log group not found: $log_group_name"
    fi
}

# Test SSL/TLS configuration
test_ssl_configuration() {
    local service_url=$1
    
    log "Testing SSL/TLS configuration..."
    
    # Test SSL certificate
    local ssl_info=$(echo | openssl s_client -servername "$service_url" -connect "$service_url:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null || true)
    
    if echo "$ssl_info" | grep -q "notAfter"; then
        log "✅ SSL certificate is valid"
        echo "$ssl_info"
    else
        warn "⚠️  Could not verify SSL certificate"
    fi
}

# Performance test
test_performance() {
    local service_url=$1
    
    log "Running basic performance test..."
    
    local start_time=$(date +%s.%N)
    local response=$(curl -s -w "%{http_code}" -o /dev/null "https://$service_url/healthcheck")
    local end_time=$(date +%s.%N)
    
    local duration=$(echo "$end_time - $start_time" | bc -l)
    local status_code=${response: -3}
    
    if [ "$status_code" = "200" ]; then
        log "✅ Performance test passed: ${duration}s response time"
    else
        warn "⚠️  Performance test failed (HTTP $status_code) in ${duration}s"
    fi
}

# Main execution
main() {
    log "Starting App Runner deployment testing..."
    
    check_prerequisites
    
    # Get service URL
    local service_url=$(get_service_url)
    
    if [ -z "$service_url" ]; then
        error "Could not get service URL"
    fi
    
    info "Testing service at: https://$service_url"
    
    # Run all tests
    test_health_check "$service_url"
    test_api_docs "$service_url"
    test_swagger_json "$service_url"
    test_database_connectivity "$service_url"
    test_ssl_configuration "$service_url"
    test_performance "$service_url"
    check_cloudwatch_logs
    
    log "🎉 All tests completed successfully!"
    log ""
    log "Next steps:"
    log "1. Configure custom domain (api.askewsoft.com) in App Runner console"
    log "2. Update DNS records to point to App Runner endpoint"
    log "3. Test with your mobile app or API client"
    log "4. Monitor CloudWatch logs for any issues"
}

# Clean up temporary files
cleanup() {
    rm -f /tmp/health_response.json /tmp/docs_response.html /tmp/swagger_response.json /tmp/db_test_response.json
}

# Set up cleanup on exit
trap cleanup EXIT

# Run main function
main "$@" 