# pantryPlusApiTs

TypeScript Express API for the pantryPlus mobile app, with OpenAPI via [TSOA](https://tsoa-community.github.io/docs/). Persistence is MySQL.

**API versioning:** **v2** and **v3** are mounted (`src/v2/`, `src/v3/`). Store 1.5.4 uses `/v2`; current mobile uses `/v3`. The **database** must stay backward compatible for all live versions — see [API Versioning](docs/API_VERSIONING.md).

## Quick start

1. `nvm use` — Node 22 (see `package.json` `engines`)
2. `npm install`
3. `cp env.example .env` and set DB + `APIPORT` (see [Environment](#environment))
4. Apply schema (one path only — see [schema/README.md](schema/README.md)):
   - **New DB:** [schema/setup.sql](schema/setup.sql) only
   - **Existing DB:** `npm run migrate` only (or apply pending SQL in a DB IDE)
5. `npm run dev` — build, watch, and run

- Swagger UI: `http://localhost:<APIPORT>/v2/docs` and `/v3/docs`
- OpenAPI: `http://localhost:<APIPORT>/v2/swagger.json` and `/v3/swagger.json`
- Health: `http://localhost:<APIPORT>/healthcheck`

## Environment

Required variables (validated in `src/shared/config.ts`):

| Variable | Purpose |
| --- | --- |
| `APIPORT` | HTTP port for the API |
| `DBPORT` | MySQL port |
| `DBHOST` | MySQL host |
| `DBUSER` / `DBPASSWORD` | DB credentials |
| `DATABASE` | Database name (typically `PANTRY_PLUS`) |
| `DBSSL` | `'true'` to enable SSL |
| `DBREJECTUNAUTHORIZED` | `'true'` / `'false'` for TLS verify |
| `NODE_ENV` | `development` or `production` (default production if unset) |
| `LOG_LEVEL` | Optional; default `info` |

Template: [env.example](env.example). Never commit `.env`.

## Project layout

```
src/
├── server.ts           # Express app, registers v2 routes + Swagger
├── middleware/         # logging, JSON errors, 404, auth error helpers
├── shared/             # config, dbDriver, auth, mayProceed, errors, …
└── v2/
    ├── shoppers/
    ├── groups/         # API “group” ↔ DB COHORT
    ├── lists/
    ├── categories/
    ├── items/
    └── locations/
schema/                 # setup.sql, migrations/, dropAll.sql, diagram
docs/                   # developer conventions (this folder’s siblings)
```

Shared code (`src/shared/`, `src/middleware/`) is shared across versions. Prefer backward-compatible changes there; see [API Versioning](./API_VERSIONING.md) when a breaking contract needs a new `src/vN/`.

Request flow: **Controller** (TSOA + `mayProceed`) → **Service** → **SQL** (`dbPost`).

## Documentation

- [API Versioning](docs/API_VERSIONING.md) — add `vN` for breaking changes; run versions side-by-side for mobile rollout
- [Auth & Identity](docs/AUTH_AND_IDENTITY.md) — Bearer format check + `X-Auth-User` / `X-Auth-Location`
- [Authorization](docs/AUTHORIZATION.md) — `mayProceed` and `may*.sql` templates
- [SQL & dbDriver](docs/SQL_AND_DBDRIVER.md) — session vars, multi-statement, UUID creates
- [Groups & Data Model](docs/GROUPS_AND_DATA_MODEL.md) — cohort mapping, tables, invites
- [Deployment](docs/DEPLOYMENT.md) — Docker, ECR, App Runner, codegen handoff
- [Schema](schema/README.md) — ER diagram, setup vs migrations
- [Testing](tests/README.md) — Schemathesis

## Develop

- `npm run build` — TSOA `spec-and-routes` (v2), `tsc`, copy SQL to `build/`
- `npm run migrate` — apply pending `schema/migrations/*.sql` (uses `.env` DB settings)
- `npm run dev` — nodemon + rebuild on `src` / `.env` changes
- Prettier + ESLint — keep formatting consistent
- Non-admin changes go through GitHub PRs

OpenAPI validation (optional):

```sh
curl -X POST -d @build/swagger.v2.json -H 'Content-Type: application/json' \
  https://validator.swagger.io/validator/debug
```

## Code generation

Generates the TypeScript Axios client into a peer `pantryPlusApiClient` checkout:

```sh
brew install openapi-generator   # once
npm run codegen                  # → ../pantryPlusApiClient/v2 and v3
```

Then commit/tag the client and bump the mobile app dependency.

## Testing

Schemathesis runs against a **live** server (see [tests/README.md](tests/README.md)):

```sh
npm run log                      # terminal 1 — API + api.log
npm run schemathesis v2          # terminal 2 — requires APIPORT in .env
```

## Docker

```sh
docker compose up --build
```

See [Deployment](docs/DEPLOYMENT.md).

## Deploy

```sh
npm run build
./scripts/build-push-to-ecr.sh   # or npm run deploy
```

Details, smoke checks, and client update steps: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).
