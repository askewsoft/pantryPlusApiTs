# API Versioning

How to introduce a new API major version (`v3`, `v4`, …) so **current and new contracts run side-by-side** in one deployment while mobile apps in the wild slowly move to the new client.

## Compatibility rules

| Layer | Breaking changes? | Rule |
| --- | --- | --- |
| **Database** | **No** | One shared schema must keep working for **every** live API version. Evolve only in backward-compatible ways (additive columns/tables, widen nullability carefully, avoid dropping/renaming columns old SQL still uses). |
| **API (`/vN`)** | **Yes, when versioned** | Breaking HTTP/JSON contracts are allowed by adding `src/vN+1/` and keeping `src/vN/` mounted until old clients are gone. |
| **Mobile app** | Paired with API | A release that consumes a new API version must ship with the matching `pantryplus-api-client/vN` (and `/vN` base URL). Older app builds keep calling the older `/vN`. |

**Goal:** the database never breaks older API versions; the API may break only when a new version is introduced **and** an in-sync mobile app release is ready to use it.

## Why version the API

pantryPlus clients are Expo/React Native builds (and OTA updates) that do not all upgrade at once. A breaking API change shipped only as `/v2` would break older app instances still calling `/v2`.

For **breaking** API changes, add a new version directory and keep the previous version’s routes registered until enough clients have migrated. Additive, backward-compatible API changes can stay on the current version. Schema changes that support the new API must still leave old version SQL correct.

**Today:** **`v2`** and **`v3`** are mounted (`src/v2/`, `src/v3/`, `tsoa.v2.json`, `tsoa.v3.json`, `/v2/*` and `/v3/*`). Legacy `v1` has been removed.

- **`/v2`**: June 2026 contract for Store build **1.5.4** (create/update item return 204; rename body does not require `listId`; location create inserts the client id).
- **`/v3`**: find-or-create items, list-scoped rename, aliases, location find-or-create. Current mobile main uses `/v3`.

## What “a version” includes

| Piece | Role |
| --- | --- |
| `src/vN/**` | Controllers, services, SQL for that contract |
| `tsoa.vN.json` | TSOA entry: `basePath` `/vN`, `routes.vN.ts`, `swagger.vN.json` |
| `src/server.ts` | Registers `RegisterVNRoutes` + serves `/vN/docs` and `/vN/swagger.json` |
| `package.json` | `buildvN`, `copysqlvN`, `codegenvN`; `build` / `codegen` run all live versions |
| `pantryPlusApiClient/vN` | Generated Axios client for that version |
| Mobile app | Points `EXPO_PUBLIC_API_URL` + `/vN` (or switches import to `pantryplus-api-client/vN`) when ready |

Shared code (`src/shared/`, `src/middleware/`) is **not** versioned by default. Change it carefully: it affects every mounted version. If a shared helper must diverge, either keep backward compatibility or duplicate/adapt under `src/vN/`.

## Adding the next version (example: `v3`)

Assume current is `v2`. Replace `3` / `v3` with the next integer as needed.

### 1. Copy the version tree

```sh
cp -R src/v2 src/v3
```

Edit controllers/services/SQL under `src/v3/` for the new contract. Leave `src/v2/` behavior stable for existing clients.

### 2. Add TSOA config

```sh
cp tsoa.v2.json tsoa.v3.json
```

Update `tsoa.v3.json`:

- `controllerPathGlobs`: `["src/v3/**/*Controller.ts"]`
- `spec.basePath`: `"/v3"`
- `spec.specFileBaseName`: `"swagger.v3"`
- `spec.version`: e.g. `"3.0.0"`
- `routes.basePath`: `"/v3"`
- `routes.routesFileName`: `"routes.v3.ts"`

Keep `authenticationModule` pointed at `src/shared/authentication.ts` unless the new version needs different auth wiring.

### 3. Register routes and docs in `server.ts`

```ts
import { RegisterRoutes as RegisterV2Routes } from "./routes.v2";
import { RegisterRoutes as RegisterV3Routes } from "./routes.v3";

RegisterV2Routes(app);
RegisterV3Routes(app);

// Mirror the existing /v2/docs and /v2/swagger.json blocks for /v3
```

Serve `build/swagger.v3.json` at `/v3/docs` and `/v3/swagger.json` the same way as v2.

### 4. Wire npm scripts

In `package.json`:

```json
"buildv2": "tsoa spec-and-routes -c tsoa.v2.json && tsc && npm run copysqlv2",
"buildv3": "tsoa spec-and-routes -c tsoa.v3.json && tsc && npm run copysqlv3",
"copysqlv2": "node scripts/copy-sql.js v2",
"copysqlv3": "node scripts/copy-sql.js v3",
"build": "npm run buildv2 && npm run buildv3",
"codegenv2": "openapi-generator generate -g typescript-axios -i build/swagger.v2.json -o ../pantryPlusApiClient/v2",
"codegenv3": "openapi-generator generate -g typescript-axios -i build/swagger.v3.json -o ../pantryPlusApiClient/v3",
"codegen": "npm run codegenv2 && npm run codegenv3"
```

`scripts/copy-sql.js` already accepts any `v[0-9]+` argument.

Order matters: run TSOA for each version before/with `tsc` so `routes.vN.ts` exists. A practical pattern is `buildv2` then `buildv3` (each may re-run `tsc`; that is fine).

### 5. Generate and publish the client

```sh
npm run build
npm run codegen
```

Commit/tag `pantryPlusApiClient` with the new `v3` (and updated `v2` if unchanged). Bump the mobile app to `pantryplus-api-client/v3` only when that app release is meant to consume the new API. Older app builds keep using `/v2`.

### 6. Deploy once, serve both

A single App Runner image (behind API Gateway) should expose **both** `/v2` and `/v3`. Do not delete the old version from the server until you have decided clients are gone (or an intentional hard cutover).

## Mobile / client URL pattern

The app sets base URL to host **including** the version suffix, e.g. `${EXPO_PUBLIC_API_URL}/v2`. When migrating a release to the new API, change that suffix (and the client import) together. See pantryPlus mobile `AUTH_AND_SESSION.md` / `ENV_AND_SECRETS.md`.

Avoid double-prefix bugs (`/v3/v3/...`): follow the same “basePath includes `/vN`” pattern already used for v2.

## When *not* to add a version

Prefer staying on the current `vN` when API changes are backward compatible, for example:

- New optional response fields
- New endpoints old clients never call
- Bug fixes that preserve request/response shapes

Add `vN+1` when the **HTTP/JSON contract** must change incompatibly (shapes, required fields, removed endpoints, different headers). Do **not** “version” by breaking the database for old routes—expand the schema compatibly and teach the new API version to use the new bits.

## Checklist

- [ ] `src/vN/` created; previous `src/v(N-1)/` left intact for production clients
- [ ] `tsoa.vN.json` with `/vN` basePath and distinct swagger/routes filenames
- [ ] `server.ts` registers routes + docs for **all** live versions
- [ ] `build` / `copysql` / `codegen` scripts cover every live version
- [ ] Client generated under `pantryPlusApiClient/vN` and published
- [ ] Mobile release planned that pairs with `/vN` (in-sync app + client)
- [ ] Shared modules reviewed for cross-version safety
- [ ] **Schema remains backward compatible** with every mounted version’s SQL (no drops/renames that break older templates)

## Related docs

- [Auth & Identity](./AUTH_AND_IDENTITY.md)
- [SQL & dbDriver](./SQL_AND_DBDRIVER.md)
- [Deployment](./DEPLOYMENT.md)
- [Groups & Data Model](./GROUPS_AND_DATA_MODEL.md) — schema evolution constraints across versions
