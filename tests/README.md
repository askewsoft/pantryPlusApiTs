# Testing for PantryPlus API

This directory contains testing implementations using multiple frameworks to ensure API quality and security.
- **Schemathesis** - Property-based testing and API contract validation
- **Snyk** - Security vulnerability scanning (coming soon)

## Schemathesis
[Schemathesis](https://schemathesis.readthedocs.io/en/stable/) automatically generates tests from your OpenAPI specification and discovers edge cases through property-based testing.

### Test Types
- Comprehensive API testing - `test_property_based.py`
- Security vulnerability testing - `test_fuzzing.py`
- Public endpoint validation - `test_public_endpoints.py`

### Configuration
- **`pytest.ini`** - Test execution settings
- **`conftest.py`** - Shared test configuration
- **`requirements.txt`** - Python dependencies

### Setup
```bash
./scripts/schemathesis-setup.sh
```

### Running Tests

#### Authentication
Make a recent auth token available to the test harness so that it can access the API.

```sh
export AUTH_TOKEN='your.jwt.token.here'  # For protected endpoints
```

#### NPM Scripts
```sh
npm run test:schemathesis          # Run all tests
npm run test:schemathesis:property # Comprehensive API testing
npm run test:schemathesis:fuzzing  # Security vulnerability testing
npm run test:schemathesis:public   # Public endpoint validation
npm run test:schemathesis:analyze  # Analyze test results
```