# 🚀 Quick Start Guide - Testing

## **One-Liner Setup & Run**

```bash
# Complete setup and run (first time)
npm run test:schemathesis

# Quick run (after setup)
npm run test:schemathesis:quick

# Run with auth reminder
npm run test:schemathesis:auth
```

## **Manual Setup (if needed)**

```bash
# 1. Activate conda environment
conda activate schemathesis

# 2. Navigate to test directory
cd tests/schemathesis

# 3. Set JWT token (for protected endpoints)
export AUTH_TOKEN='your.jwt.token.here'

# 4. Run tests
pytest test_property_based.py -v
```

## **Environment Variables**

| Variable | Purpose | Example |
|----------|---------|---------|
| `AUTH_TOKEN` | JWT token for protected endpoints | `export AUTH_TOKEN='eyJ...'` |

## **What Gets Tested**

- ✅ **Public endpoints** (health, docs) - always tested
- 🔒 **Protected endpoints** - tested if `AUTH_TOKEN` is set
- 🛡️ **Security scenarios** - invalid auth, malformed data
- 📊 **Performance** - response times, payload sizes

## **Common Commands**

```bash
# Test only public endpoints
pytest test_public_endpoints.py -v

# Test with authentication
export AUTH_TOKEN='your.token' && pytest test_property_based.py -v

# Quick health check
pytest test_public_endpoints.py::test_health_endpoint -v
```

## **Troubleshooting**

- **"No module named schemathesis"** → Run `npm run test:schemathesis` first
- **"API not accessible"** → Make sure `npm run dev` is running
- **"401/403 errors"** → Set `AUTH_TOKEN` environment variable
- **"500 errors"** → API needs fixing (not a test issue)

## **Need Help?**

- Check `tests/README.md` for detailed documentation
- Run `pytest --help` for pytest options
- Check `tests/schemathesis/conftest.py` for test configuration
