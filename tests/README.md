# Testing for PantryPlus API

This directory contains testing implementations using multiple frameworks to ensure API quality and security.
- **Schemathesis** - Property-based testing and API contract validation
- **Snyk** - Security vulnerability scanning (coming soon)

## Schemathesis
[Schemathesis](https://schemathesis.readthedocs.io/en/stable/) automatically generates tests from your OpenAPI specification and discovers edge cases through property-based testing.

### What It Tests
- **Comprehensive API Coverage** - Tests all endpoints in the API specification
- **Version Support** - Works with v1, v2, or any future API version
- **Authentication Handling** - Automatically handles protected vs public endpoints
- **Edge Case Discovery** - Uses Hypothesis for property-based testing

### How It Works
The testing system uses Schemathesis CLI directly against the swagger endpoints:
- Loads OpenAPI spec from `/v1/swagger.json` or `/v2/swagger.json`
- Generates test cases using Hypothesis
- Runs tests against the live API
- Handles authentication and error responses appropriately

### Setup
No special setup required! The system automatically:
- Sources environment variables from `.env`
- Validates API accessibility on the configured port
- Creates output directories as needed

### Running Tests

#### Authentication
For testing protected endpoints, set an auth token:
```sh
export AUTH_TOKEN='your.jwt.token.here'
```

#### API Version Selection
Tests support different API versions. Add the version as the first argument:

```sh
npm run test:schemathesis v1          # Test entire v1 API
npm run test:schemathesis v2          # Test entire v2 API
npm run test:schemathesis:analyze     # Analyze test results
```

If no version is specified, the scripts will prompt you to choose one.

#### Test Output
Results are saved to timestamped log files:
```
tests/schemathesis/test_outputs/
├── schemathesis_v1_20250814_165423.log
├── schemathesis_v2_20250814_171803.log
└── ...
```

### Analysis
After running tests, analyze the results:
```sh
npm run test:schemathesis:analyze
```

This will help you understand test coverage, identify failures, and review API behavior.

### Environment Variables
- **`APIPORT`** - API server port (required, read from `.env`)
- **`AUTH_TOKEN`** - JWT token for authenticated endpoints

The system will fail explicitly if required environment variables are missing.