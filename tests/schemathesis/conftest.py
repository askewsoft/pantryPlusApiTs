# pytest configuration for Schemathesis testing
import pytest
import schemathesis
from schemathesis import from_uri
from schemathesis.specs.openapi import loaders

# Load the OpenAPI spec
@pytest.fixture(scope="session")
def api_schema():
    """Load the OpenAPI schema from the built swagger.json file"""
    return from_uri("http://localhost:3000/v1/swagger.json")

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