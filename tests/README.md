# Testing for PantryPlus API

This directory contains testing implementations using **Schemathesis** - a powerful tool that automatically generates tests from your OpenAPI specification and discovers edge cases through property-based testing.

## Overview

Automated testing ensures your API implementation matches its specification and discovers edge cases automatically. These tools are particularly valuable for:

- **Automated test generation** from OpenAPI specs
- **Edge case discovery** through property-based testing
- **Security vulnerability detection** through fuzzing
- **API contract validation** in CI/CD pipelines

## Directory Structure

```
tests/
├── schemathesis/            # Schemathesis property-based testing
│   ├── conftest.py          # pytest configuration
│   ├── test_property_based.py  # Property-based tests
│   ├── test_fuzzing.py      # Security fuzzing tests
│   ├── requirements.txt     # Python dependencies
│   └── pytest.ini          # pytest configuration
└── snyk/                   # Snyk security testing (coming soon)
```



## Schemathesis - Property-Based Testing

Schemathesis uses property-based testing to automatically discover edge cases and potential security vulnerabilities.

### Setup

```bash
cd contract-tests/schemathesis
pip install -r requirements.txt
```

### Running Schemathesis Tests

```bash
# Set your JWT token for protected endpoint testing (optional)
export AUTH_TOKEN='your.jwt.token.here'

# Run all property-based tests
pytest test_property_based.py -v

# Run fuzzing tests
pytest test_fuzzing.py -v

# Run with specific markers
pytest -m "not slow"  # Skip slow tests
pytest -m security    # Run only security tests

# Run with custom strategies
pytest test_property_based.py::test_item_creation_edge_cases --hypothesis-max-examples=200
```

### Authentication Setup

For testing protected endpoints, you'll need a valid JWT token:

```bash
# Set your JWT token (get this from your auth service)
export AUTH_TOKEN='your.jwt.token.here'

# Verify it's set
echo $AUTH_TOKEN
```

**Security Note:** Never commit tokens to your repository. The `AUTH_TOKEN` environment variable is automatically detected by the test framework.

### What Schemathesis Does

1. **Generates test data** using Hypothesis strategies
2. **Tests edge cases** automatically (null values, empty strings, large numbers, etc.)
3. **Discovers security vulnerabilities** through fuzzing
4. **Validates responses** against the OpenAPI spec

### Example Discoveries

```python
# Schemathesis might discover:
# - SQL injection vulnerabilities
# - XSS vulnerabilities
# - Buffer overflow issues
# - Authentication bypass attempts
# - Performance problems with large payloads
```

## Key Features

### Schemathesis Features
- ✅ **Property-based testing** with Hypothesis
- ✅ **Security fuzzing** for vulnerability discovery
- ✅ **Custom test strategies** for edge cases
- ✅ **Performance testing** with concurrent requests
- ✅ **Detailed failure reports** with minimal examples
- ✅ **Automatic test generation** from OpenAPI spec
- ✅ **Response validation** against schema
- ✅ **CI/CD integration**

## Integration with Your Workflow

### Pre-commit Hook
Add to your `.git/hooks/pre-commit`:

```bash
#!/bin/bash
# Run tests before commit
cd tests/schemathesis && pytest test_property_based.py -x
```

### CI/CD Pipeline
Add to your CI configuration:

```yaml
# GitHub Actions example
- name: Run Tests
  run: |
    cd tests/schemathesis
    pip install -r requirements.txt
    pytest test_property_based.py --junitxml=test-results.xml
```

### Development Workflow
1. **Write/update OpenAPI spec** in your TSOA controllers
2. **Generate spec** with `npm run build`
3. **Run contract tests** to validate implementation
4. **Fix any mismatches** between spec and implementation
5. **Commit changes** when all tests pass

## Customization

### Schemathesis Strategies
Modify `tests/schemathesis/test_property_based.py` to:
- Add custom data generators
- Test specific business logic
- Add domain-specific validations
- Customize test parameters

### Future: Snyk Integration
When you add Snyk, you'll be able to:
- Run security scans on your dependencies
- Test for known vulnerabilities
- Monitor for new security issues
- Integrate with your CI/CD pipeline

## Best Practices

1. **Run contract tests frequently** during development
2. **Fix spec/implementation mismatches** immediately
3. **Use custom hooks** for authentication and test data
4. **Monitor fuzzing results** for security issues
5. **Integrate into CI/CD** for automated validation

## Troubleshooting

### Common Issues

**Schemathesis finds too many edge cases:**
- Adjust Hypothesis settings (max_examples, deadline)
- Add custom strategies for your domain
- Filter out irrelevant test cases

**Tests are slow:**
- Reduce max_examples in Hypothesis settings
- Use parallel test execution
- Skip slow tests with markers

**Authentication issues:**
- Check that conftest.py properly sets auth headers
- Verify JWT tokens are valid
- Ensure protected endpoints are properly configured

## Next Steps

1. **Install dependencies** for Schemathesis
2. **Start your API server** on localhost:3000
3. **Run a quick test** to see what it discovers
4. **Customize the configurations** for your specific needs
5. **Integrate into your development workflow**
6. **Add Snyk** for dependency security scanning

These tools will help you discover edge cases and security issues that traditional unit tests might miss!