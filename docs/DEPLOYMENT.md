# Deployment & Local Docker

How the API is built, containerized, and shipped to AWS App Runner.

## Local run (Node)

1. `nvm use` (see `.nvmrc` / `package.json` engines — Node 22)
2. `cp env.example .env` and fill DB + `APIPORT` values
3. Apply schema if needed (one path only — see [schema/README.md](../schema/README.md)):
   - **New DB:** `schema/setup.sql` only
   - **Existing DB:** `npm run migrate` only (or apply pending SQL in a DB IDE)
4. `npm install && npm run build && npm start`
   Or hot rebuild: `npm run dev`

Swagger UI: `http://localhost:<APIPORT>/v2/docs`
OpenAPI JSON: `http://localhost:<APIPORT>/v2/swagger.json`
Health: `http://localhost:<APIPORT>/healthcheck`

For RDS SSL in non-local setups: `npm run downloadcerts` → `certs/rds-ca.pem`.

## Local Docker

`docker compose up --build` builds the image and runs with `.env`, mapping host `8000` → container `$APIPORT`. Mounts `./certs` read-only. Sets `NODE_ENV=development` in compose even when mimicking the App Runner image shape.

## Production path (API Gateway → App Runner)

Public clients call **API Gateway**, which uses a **Cognito JWT authorizer**, then forwards to **App Runner**. Signature verification happens at Gateway; see [Auth & Identity](./AUTH_AND_IDENTITY.md).

High-level deploy flow for the App Runner image:

1. `npm run build` — TSOA routes/spec, `tsc`, copy SQL into `build/`
2. `./scripts/build-push-to-ecr.sh` (or `npm run deploy`) — build `linux/amd64` image, tag, push to ECR
3. App Runner redeploys from the ECR image (monitor CloudWatch / App Runner events)
4. Smoke-check health and a known authenticated route (through the Gateway URL in prod)

The push script currently targets a fixed ECR repository/account/region — read `scripts/build-push-to-ecr.sh` before running.

### Runtime config

App Runner (or the task) must supply the same env vars as [env.example](../env.example) (`APIPORT`, `DBHOST`, `DBUSER`, `DBPASSWORD`, `DATABASE`, `DBSSL`, etc.). Production expects RDS CA at `certs/rds-ca.pem` inside the image/workdir when `NODE_ENV=production`.

Database credentials are intended to live in AWS (e.g. SSM Parameter Store / secrets) and be injected as env — exact parameter names are environment-specific; confirm in AWS for the `pantryplus-api-service` before changing them.

### Verify

```sh
aws apprunner describe-service --service-name pantryplus-api-service --region us-east-1
curl https://<app-runner-host>/healthcheck
```

## After API contract changes

1. `npm run codegen` → writes `../pantryPlusApiClient/v2`
2. Commit/tag the client repo
3. Bump the mobile app’s `pantryplus-api-client` dependency to the new tag

See root README “Code Generation” and the pantryPlus mobile `AUTH_AND_SESSION.md` bump section.
