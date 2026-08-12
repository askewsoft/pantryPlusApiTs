# Auth & Identity

How pantryPlus API authenticates requests and resolves the acting user.

## Edge vs app (production)

In **production**, the API sits behind **Amazon API Gateway** with a **Cognito JWT authorizer**. Gateway cryptographically validates the Bearer token against the Cognito user pool before traffic reaches App Runner: the Node process does not re-verify the JWT signature; it assumes callers that cleared Gateway are already authenticated.

Local/`npm run dev` traffic usually hits Express **directly** (no Gateway), so the in-process bearer check is only a format gate—useful for tooling and local clients, not a substitute for Cognito verification.

## Two layers (in the Node app)

| Layer | Mechanism | What it proves |
| --- | --- | --- |
| **Bearer token** (`Authorization`) | TSOA `@Security("bearerAuth")` → `expressAuthentication` | Request has a JWT-**shaped** token (signature already enforced by API Gateway in prod) |
| **User identity** (`X-Auth-User`) | Controller `@Header("X-Auth-User")` → `mayProceed` / SQL | Which shopper email is acting |

Authorization decisions use the **email** from `X-Auth-User`, not claims extracted from the JWT. (Unlike we-tree-api, this API does not resolve the principal from JWT `sub` inside `expressAuthentication`.)

Optional location context:

| Header | Purpose |
| --- | --- |
| `X-Auth-Location` | Known location UUID for category ordinals, purchase, etc. Validated with `validateUUIDParam` when required |

## Bearer validation in this repo

`src/shared/authentication.ts` checks **format only** (three base64-ish JWT segments). It does **not** cryptographically verify the Cognito signature—by design when API Gateway owns verification in production.

Both `development` and `production` process modes resolve an empty principal (`Promise.resolve({})`) after the format check succeeds. Identity for business logic comes from `X-Auth-User`.

- **Via API Gateway (prod):** Bearer present ⇒ Cognito-validated at the edge; still require a correct `X-Auth-User` for access SQL.
- **Direct to the app (local/dev):** Bearer present ⇒ format-only; do not treat it as proof of a Cognito session unless you obtained a real token yourself.

Keep the mobile client sending the signed-in user’s email as `X-Auth-User` consistently with the Cognito access token it holds.

## Typical request

```http
Authorization: Bearer <cognito-access-token>
X-Auth-User: shopper@example.com
X-Auth-Location: <uuid>   # when the endpoint needs it
Content-Type: application/json
```

Missing `X-Auth-User` (empty email) → `ErrorCode.MISSING_IDENTITY` → **401**.

## Related code

- `src/shared/authentication.ts` — bearer format gate
- `src/shared/mayProceed.ts` — identity + access SQL
- `src/shared/uuidValidation.ts` — UUID path/header checks
- Controllers under `src/v2/**` — `@Security` + `@Header("X-Auth-User")`

See also [Authorization](./AUTHORIZATION.md), [Deployment](./DEPLOYMENT.md), and the mobile doc `AUTH_AND_SESSION.md` in the pantryPlus app repo.
