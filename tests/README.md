# Testing the pantryPlus API

Current automated coverage is primarily **Schemathesis** (property-based checks from the OpenAPI spec) against a **live** local server. There is no separate unit/integration suite in this repo yet.

## Schemathesis

[Schemathesis](https://schemathesis.readthedocs.io/en/stable/) loads `/v2/swagger.json` and generates requests with Hypothesis.

### Setup

1. Install the Schemathesis CLI (see upstream docs for your OS).
2. Ensure `.env` has a valid `APIPORT` (and DB settings so the API can start).
3. Start the API in another terminal:

   ```sh
   npm run log          # or npm run dev
   ```

### Run

```sh
npm run schemathesis v2
# or
./scripts/schemathesis.sh v2
```

The script:

- Sources `.env` for `APIPORT`
- Fails if `http://localhost:$APIPORT/healthcheck` is down
- Runs against `http://localhost:$APIPORT/v2/swagger.json`
- Writes logs under `tests/schemathesis/test_outputs/schemathesis_v2_<timestamp>.log`

### Auth note

Older notes mentioned `AUTH_TOKEN`. The current `scripts/schemathesis.sh` does **not** inject Authorization / `X-Auth-User` headers. Expect many protected routes to fail auth unless you extend the runner. Treat results as contract/fuzz signal, not a full authenticated regression suite.

### Env

| Variable | Required | Purpose |
| --- | --- | --- |
| `APIPORT` | Yes | Port of the running API |
| DB_* / etc. | For server | So `npm run log` can serve real responses |

## Manual smoke

```sh
curl -s "http://localhost:$APIPORT/healthcheck"
curl -s "http://localhost:$APIPORT/v2/swagger.json" | head
```

Authenticated calls need Bearer + `X-Auth-User` (see [Auth & Identity](../docs/AUTH_AND_IDENTITY.md)). The mobile repo’s `npm run gettoken` can mint a Cognito access token when configured.
