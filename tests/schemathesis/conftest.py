# pytest configuration for Schemathesis testing
import pytest
import schemathesis
import os
from schemathesis import from_uri
from schemathesis.specs.openapi import loaders

def pytest_addoption(parser):
    """Add command line option for API version"""
    parser.addoption(
        "--api-version",
        action="store",
        default="v1",
        help="API version to test (v1, v2, etc.)"
    )

@pytest.fixture(scope="session")
def api_version(request):
    """Get the API version from command line argument"""
    return request.config.getoption("--api-version")

@pytest.fixture(scope="session")
def api_schema(api_version):
    """Load the OpenAPI schema from the built swagger.json file for the specified version"""
    api_port = os.getenv('APIPORT')
    if not api_port:
        raise ValueError("APIPORT environment variable is required but not set")
    return from_uri(f"http://localhost:{api_port}/{api_version}/swagger.json")

@pytest.fixture(scope="session")
def auth_headers():
    """Provide authentication headers for protected endpoints"""
    return {"Authorization": "Bearer test-jwt-token"}

@pytest.fixture(scope="session")
def test_data():
    """Test data that persists across test sessions"""
    return {
        "user_id": None,
        "group_id": None,
        "list_id": None,
        "item_id": None
    }

# Custom strategies for generating test data
@pytest.fixture(scope="session")
def custom_strategies():
    """Define custom strategies for generating test data"""
    return {
        "email": schemathesis.strategies.from_regex(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"),
        "phone": schemathesis.strategies.from_regex(r"\+?[1-9]\d{1,14}"),
        "uuid": schemathesis.strategies.from_regex(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"),
        "positive_integer": schemathesis.strategies.integers(min_value=1, max_value=1000000),
        "quantity": schemathesis.strategies.integers(min_value=1, max_value=100),
        "price": schemathesis.strategies.floats(min_value=0.01, max_value=1000.0),
        "latitude": schemathesis.strategies.floats(min_value=-90.0, max_value=90.0),
        "longitude": schemathesis.strategies.floats(min_value=-180.0, max_value=180.0)
    }