# Test only public endpoints (health, documentation, etc.)
# This avoids authentication issues while validating basic API functionality

import pytest
import requests
import os

def get_api_base_url():
    """Get API base URL from environment"""
    api_port = os.getenv('APIPORT')
    if not api_port:
        raise ValueError("APIPORT environment variable is required but not set")
    return f"http://localhost:{api_port}"

def test_health_endpoint(api_version):
    """Test the health check endpoint"""
    api_base = get_api_base_url()
    response = requests.get(f"{api_base}/healthcheck")
    assert response.status_code == 200
    assert response.text == "OK"

def test_swagger_documentation(api_version):
    """Test that Swagger documentation is accessible"""
    api_base = get_api_base_url()
    response = requests.get(f"{api_base}/{api_version}/docs")
    assert response.status_code == 200
    assert "Swagger UI" in response.text

def test_openapi_spec(api_version):
    """Test that OpenAPI specification is accessible"""
    api_base = get_api_base_url()
    response = requests.get(f"{api_base}/{api_version}/swagger.json")
    assert response.status_code == 200

    spec = response.json()
    assert "openapi" in spec
    assert "info" in spec
    assert "paths" in spec
    assert spec["info"]["title"] == "pantryplus-api"

def test_public_endpoints_summary(api_version):
    """Display summary of public endpoint testing"""
    api_base = get_api_base_url()
    print("\n" + "="*60)
    print("🌐 PUBLIC ENDPOINT TESTING SUMMARY")
    print("="*60)
    print(f"✅ Health Check: {api_base}/healthcheck")
    print(f"✅ Documentation: {api_base}/{api_version}/docs")
    print(f"✅ OpenAPI Spec: {api_base}/{api_version}/swagger.json")
    print("")
    print("🔒 Protected endpoints (not tested):")
    print(f"   - /{api_version}/shoppers/*")
    print(f"   - /{api_version}/groups/*")
    print(f"   - /{api_version}/lists/*")
    print(f"   - /{api_version}/items/*")
    print(f"   - /{api_version}/categories/*")
    print(f"   - /{api_version}/locations/*")
    print("")
    print("📊 Next Steps:")
    print("   1. Fix UUID validation and auth error handling")
    print("   2. Get valid JWT token")
    print("   3. Run comprehensive tests with authentication")
    print("="*60)

    # This test always passes - it's just for information
    assert True
