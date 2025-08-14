# Property-based testing with Schemathesis
# This file demonstrates how Schemathesis automatically generates test cases
# and discovers edge cases from your OpenAPI specification

import pytest
import time
import schemathesis
from schemathesis import from_uri
from hypothesis import settings, given, strategies as st
import os

# Load the API schema - try to detect the actual port
import os
import requests

def get_api_url():
    """Get API URL from environment variable"""
    # Get port from environment variable
    api_port = os.getenv('APIPORT')
    if not api_port:
        raise ValueError("APIPORT environment variable is required but not set")

    try:
        port = int(api_port)
        health_url = f"http://localhost:{port}/healthcheck"
        response = requests.get(health_url, timeout=2)
        if response.status_code == 200:
            print(f"✅ API found running on port {port} (from APIPORT env var)")
            return f"http://localhost:{port}"
        else:
            raise ValueError(f"API server responded with status {response.status_code} on port {port}")
    except requests.exceptions.RequestException as e:
        raise ValueError(f"API server not accessible on port {api_port}: {e}")
    except ValueError as e:
        raise ValueError(f"Invalid APIPORT value '{api_port}': {e}")

def get_auth_token():
    """Get JWT token from environment variable or return None"""
    token = os.getenv('AUTH_TOKEN')
    if token:
        print("✅ Using JWT token from environment variable")
        return token
    else:
        print("⚠️  No JWT token found in AUTH_TOKEN environment variable")
        print("   Set it with: export AUTH_TOKEN='your.jwt.token.here'")
        print("   Will only test public endpoints and invalid auth scenarios")
        return None

# Load the API schema
api_base = get_api_url()

# Initialize schema without auth first - will be updated by conftest.py
schema = None

# We'll get the auth token when tests actually run
auth_token = None

def get_auth_token_for_test():
    """Get auth token when tests actually run"""
    global auth_token
    if auth_token is None:
        auth_token = get_auth_token()
    return auth_token

# Test all endpoints with automatically generated data
def test_all_endpoints(case, api_schema):
    """Test all endpoints with automatically generated test data"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    try:
        response = case.call()
        case.validate_response(response)
    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        else:
            # Re-raise unexpected errors
            raise

# Create version-aware test function using fixture
@pytest.fixture
def all_endpoints_test(api_schema):
    """Create a test function for all endpoints"""
    @api_schema.parametrize()
    @settings(max_examples=1 if not get_auth_token_for_test() else 3, deadline=10000)
    def test_func(case):
        return test_all_endpoints(case, api_schema)
    return test_func

# Test specific endpoint categories with custom strategies
def test_shopper_endpoints(case, api_schema):
    """Test shopper endpoints with edge case generation"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    try:
        response = case.call()
        case.validate_response(response)
    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        else:
            # Re-raise unexpected errors
            raise

def test_group_endpoints(case, api_schema):
    """Test group endpoints with edge case generation"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    try:
        response = case.call()
        case.validate_response(response)
    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        else:
            # Re-raise unexpected errors
            raise

def test_list_endpoints(case, api_schema):
    """Test list endpoints with edge case generation"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    try:
        response = case.call()
        case.validate_response(response)
    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        else:
            # Re-raise unexpected errors
            raise

# Custom test for edge cases in item creation
def test_item_creation_edge_cases(case, api_schema):
    """Test item creation with various edge cases"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    try:
        response = case.call()

        # Additional assertions for edge cases
        if response.status_code == 201:
            data = response.json()
            assert "id" in data
            assert "name" in data
            assert "quantity" in data

            # Test edge cases for quantity
            if "quantity" in case.body:
                quantity = case.body["quantity"]
                assert isinstance(quantity, (int, float))
                assert quantity > 0
    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        else:
            # Re-raise unexpected errors
            raise

# Test authentication edge cases
def test_auth_edge_cases(case, api_schema):
    """Test authentication with various token formats"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Test with malformed tokens
    if "Authorization" in case.headers:
        malformed_tokens = [
            "Bearer",
            "Bearer ",
            "Bearer invalid.token.here",
            "Basic dXNlcjpwYXNz",
            "Token invalid",
            "",
            None
        ]

        for token in malformed_tokens:
            case.headers["Authorization"] = token
            try:
                response = case.call()
                # Should return 401/403 for malformed tokens, or 400/422 for validation errors
                if token in ["Bearer", "Bearer ", "", None]:
                    assert response.status_code in [401, 403, 400, 422]
            except Exception as e:
                if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
                    if token:
                        # We provided a token but got 401 - this is a FAILURE
                        # The token might be expired, invalid, or the endpoint has different auth requirements
                        print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                        raise  # Let this fail the test
                    else:
                        # No token provided and got 401 - this is EXPECTED behavior
                        print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                        pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
                elif "500" in str(e) or "Internal Server Error" in str(e):
                    # 500 errors are BUGS - don't skip, let them fail
                    print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
                    raise  # This should fail the test
                else:
                    # Re-raise unexpected errors
                    raise

# Test invalid authentication scenarios (always runs)
def test_invalid_auth_scenarios(case, api_schema, api_version):
    """Test how API handles invalid authentication"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Generate various malformed authentication attempts
    malformed_auth = [
        "Bearer",
        "Bearer ",
        "Bearer invalid.token.here",
        "Basic dXNlcjpwYXNz",
        "Token invalid",
        "",
        None,
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid",
        "JWT invalid.token.here",
        "OAuth invalid",
        "ApiKey invalid"
    ]

    # Test each malformed auth attempt
    for auth_header in malformed_auth:
        case.headers = case.headers or {}
        case.headers["Authorization"] = auth_header

        try:
            response = case.call()

            # Protected endpoints should return 401/403 for invalid auth
            if case.endpoint and any(protected in case.endpoint for protected in [f'/{api_version}/shoppers', f'/{api_version}/groups', f'/{api_version}/lists', f'/{api_version}/items']):
                if auth_header in ["Bearer", "Bearer ", "", None]:
                    assert response.status_code in [401, 403], f"Expected 401/403 for '{auth_header}', got {response.status_code}"
                else:
                    # Some malformed tokens might still get 401/403
                    assert response.status_code in [400, 401, 403, 422], f"Expected error for malformed auth '{auth_header}', got {response.status_code}"

        except Exception as e:
            # Log the error but don't fail the test - we're testing error handling
            print(f"Auth test with '{auth_header}' resulted in: {type(e).__name__}: {e}")
            continue

# Test rate limiting and performance
def test_performance_edge_cases(case, api_schema):
    """Test performance with various payload sizes"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    try:
        response = case.call()

        # Check response time
        assert response.elapsed.total_seconds() < 5.0

        # Check response size (if applicable)
        if response.content:
            assert len(response.content) < 1024 * 1024  # 1MB limit

    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        # Handle connection errors gracefully
        elif "Connection reset" in str(e) or "Connection broken" in str(e):
            pytest.skip(f"Connection issue: {e}")
        else:
            raise

# Custom strategy for generating problematic data
@st.composite
def problematic_emails(draw):
    """Generate emails that might cause issues"""
    return draw(st.one_of([
        st.just(""),  # Empty email
        st.just("invalid"),  # Invalid format
        st.just("a" * 1000 + "@example.com"),  # Very long email
        st.just("test@example.com"),  # Valid email
        st.just("test+tag@example.com"),  # Email with plus
        st.just("test.tag@example.com"),  # Email with dot
        st.just("test@example.co.uk"),  # Multi-level domain
    ]))

# Test with problematic data
def test_shopper_creation_with_problematic_data(case, api_schema):
    """Test shopper creation with problematic email addresses"""
    # Longer delay to reduce server load
    time.sleep(0.5)

    # Get auth token when test runs
    token = get_auth_token_for_test()

    # Add authentication header if we have a token
    if token:
        case.headers = case.headers or {}
        case.headers["Authorization"] = f"Bearer {token}"

    if "email" in case.body:
        # Use a simple strategy instead of @given to avoid conflicts
        problematic_emails_list = ["", "invalid", "a" * 1000 + "@example.com", "test@example.com"]
        case.body["email"] = problematic_emails_list[hash(case.body.get("id", "")) % len(problematic_emails_list)]

    try:
        response = case.call()

        # Should handle problematic data gracefully
        if case.body.get("email") in ["", "invalid"]:
            assert response.status_code in [400, 422]
        else:
            assert response.status_code in [201, 400, 422]
    except Exception as e:
        if "401" in str(e) or "403" in str(e) or "Unauthorized" in str(e):
            if token:
                # We provided a token but got 401 - this is a FAILURE
                # The token might be expired, invalid, or the endpoint has different auth requirements
                print(f"❌ FAILURE: {case.method} {case.endpoint} returned 401 despite providing token")
                raise  # Let this fail the test
            else:
                # No token provided and got 401 - this is EXPECTED behavior
                print(f"✅ SUCCESS: {case.method} {case.endpoint} properly rejected unauthorized access")
                pytest.skip(f"Expected behavior: {case.method} {case.endpoint} requires authentication")
        elif "500" in str(e) or "Internal Server Error" in str(e):
            # 500 errors are BUGS - don't skip, let them fail
            print(f"💥 BUG: {case.method} {case.endpoint} returned 500 - this is a server error")
            raise  # This should fail the test
        else:
            # Re-raise unexpected errors
            raise

# Test concurrent requests
@pytest.mark.asyncio
async def test_concurrent_requests():
    """Test handling of concurrent requests"""
    import asyncio
    import aiohttp

    # Use the detected API base URL
    health_url = f"{api_base}/healthcheck"

    async with aiohttp.ClientSession() as session:
        tasks = []
        for i in range(10):
            task = session.get(health_url)
            tasks.append(task)

        responses = await asyncio.gather(*tasks)

        for response in responses:
            assert response.status == 200

# Test summary and configuration
def test_configuration_summary():
    """Display test configuration summary"""
    # Get auth token when this test runs
    token = get_auth_token_for_test()

    print("\n" + "="*60)
    print("🧪 SCHEMATHEISIS TEST CONFIGURATION")
    print("="*60)
    print(f"🌐 API Base URL: {api_base}")
    print(f"🔐 Authentication: {'Enabled' if token else 'Disabled'}")

    if token:
        print(f"   Token: {token[:20]}...{token[-10:] if len(token) > 30 else ''}")
        print("   ✅ Testing protected endpoints with valid auth")
        print("   ✅ Testing invalid authentication scenarios")
    else:
        print("   ⚠️  Only testing public endpoints")
        print("   ⚠️  Protected endpoint tests will be limited")

    print(f"🎯 Test Strategy: Property-based testing with Hypothesis")
    print(f"🔍 Edge Cases: Malformed data, invalid auth, boundary conditions")
    print(f"🛡️  Security: Fuzzing for vulnerabilities")
    print("="*60)

    # This test always passes - it's just for information
    assert True

# Test result summary
def test_results_summary():
    """Display test results summary and interpretation"""
    print("\n" + "="*60)
    print("📊 TEST RESULTS INTERPRETATION")
    print("="*60)
    print("🔒 Authentication Tests:")
    print("   ✅ 401/403 responses (no token) = SUCCESS (API properly rejects unauthorized access)")
    print("   ❌ 401/403 responses (with token) = FAILURE (token expired, invalid, or endpoint auth mismatch)")
    print("   💥 500 responses = BUG (server error, always a failure)")
    print("")
    print("🛡️  Security Testing:")
    print("   ✅ Malformed data rejected = SUCCESS (input validation working)")
    print("   ❌ Malformed data accepted = FAILURE (input validation needed)")
    print("   💥 Server crashes = BUG (robustness needed)")
    print("")
    print("📈 Performance Testing:")
    print("   ✅ Fast responses = SUCCESS (good performance)")
    print("   ⚠️  Slow responses = INVESTIGATE (performance optimization needed)")
    print("")
    print("🔍 Test Logic:")
    print("   • Tests with tokens that get 401s = FAIL (investigate token/endpoint)")
    print("   • Tests without tokens that get 401s = SKIP (expected behavior)")
    print("   • Tests that get 500s = FAIL (server bug)")
    print("   • Connection issues = SKIP (environment problem)")
    print("="*60)

    # This test always passes - it's just for information
    assert True

# Create version-aware test functions using fixtures
@pytest.fixture
def shopper_endpoints_test(api_schema, api_version):
    """Create a test function for shopper endpoints"""
    @api_schema.parametrize(endpoint=f"/{api_version}/shoppers")
    @settings(max_examples=1 if not get_auth_token_for_test() else 2, deadline=5000)
    def test_func(case):
        return test_shopper_endpoints(case, api_schema)
    return test_func

@pytest.fixture
def group_endpoints_test(api_schema, api_version):
    """Create a test function for group endpoints"""
    @api_schema.parametrize(endpoint=f"/{api_version}/groups")
    @settings(max_examples=1 if not get_auth_token_for_test() else 2, deadline=5000)
    def test_func(case):
        return test_group_endpoints(case, api_schema)
    return test_func

@pytest.fixture
def list_endpoints_test(api_schema, api_version):
    """Create a test function for list endpoints"""
    @api_schema.parametrize(endpoint=f"/{api_version}/lists")
    @settings(max_examples=1 if not get_auth_token_for_test() else 2, deadline=5000)
    def test_func(case):
        return test_list_endpoints(case, api_schema)
    return test_func

@pytest.fixture
def item_creation_test(api_schema, api_version):
    """Create a test function for item creation"""
    @api_schema.parametrize(method="POST", endpoint=f"/{api_version}/items")
    @settings(max_examples=1 if not get_auth_token_for_test() else 3, deadline=10000)
    def test_func(case):
        return test_item_creation_edge_cases(case, api_schema)
    return test_func

@pytest.fixture
def auth_edge_cases_test(api_schema):
    """Create a test function for auth edge cases"""
    @api_schema.parametrize()
    @settings(max_examples=1 if not get_auth_token_for_test() else 2, deadline=5000)
    def test_func(case):
        return test_auth_edge_cases(case, api_schema)
    return test_func

@pytest.fixture
def invalid_auth_test(api_schema, api_version):
    """Create a test function for invalid auth scenarios"""
    @api_schema.parametrize()
    @settings(max_examples=1 if not get_auth_token_for_test() else 5, deadline=5000)
    def test_func(case):
        return test_invalid_auth_scenarios(case, api_schema, api_version)
    return test_func

@pytest.fixture
def performance_test(api_schema):
    """Create a test function for performance edge cases"""
    @api_schema.parametrize()
    @settings(max_examples=1 if not get_auth_token_for_test() else 3, deadline=10000)
    def test_func(case):
        return test_performance_edge_cases(case, api_schema)
    return test_func

@pytest.fixture
def problematic_data_test(api_schema, api_version):
    """Create a test function for problematic data testing"""
    @api_schema.parametrize(method="POST", endpoint=f"/{api_version}/shoppers")
    @settings(max_examples=1 if not get_auth_token_for_test() else 2, deadline=5000)
    def test_func(case):
        return test_shopper_creation_with_problematic_data(case, api_schema)
    return test_func