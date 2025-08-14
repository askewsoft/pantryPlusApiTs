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
- **`conftest.py`** - Shared test configuration and version selection
- **`requirements.txt`** - Python dependencies

### Setup
```bash
./scripts/schemathesis-setup.sh
```

**Note**: After setup, you'll be in the `schemathesis` conda environment. The npm scripts will work automatically from any shell.

### Running Tests

#### Authentication
Make a recent auth token available to the test harness so that it can access the API.

```sh
export AUTH_TOKEN='your.jwt.token.here'  # For protected endpoints
```

#### API Version Selection
Tests support different API versions. Add the version as the first argument to npm scripts:

```sh
npm run test:schemathesis v1          # Run all tests against v1
npm run test:schemathesis v2          # Run all tests against v2
npm run test:schemathesis:public v1   # Public endpoint validation against v1
npm run test:schemathesis:property v2    # Comprehensive API testing
npm run test:schemathesis:fuzzing v2     # Security vulnerability testing
npm run test:schemathesis:analyze v2     # Analyze test results from log files
```

If no version is specified, the scripts will prompt you to choose one.