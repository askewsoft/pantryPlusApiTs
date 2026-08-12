# SQL Templates & `dbDriver`

Conventions for versioned SQL files and how the Node layer executes them.

## Layout

```
src/v2/<domain>/
├── *Controller.ts      # TSOA routes, mayProceed, validation
├── *Service.ts         # dbPost / dbTransaction calls
└── sql/
    ├── create*.sql
    ├── may*.sql
    └── …
```

`npm run build` (via `copysqlv2`) copies `src/v2/**/*.sql` → `build/v2/**` so runtime `__dirname` paths resolve next to compiled JS.

## Session variables

Define parameters as MySQL session variables at the top of each template, then reuse them. Prefer this over repeating `UUID_TO_BIN(:id)` inline.

```sql
SET @userEmail = :email;
SET @listId = UUID_TO_BIN(:id);

SELECT 1 AS ALLOWED
FROM LIST
WHERE ID = @listId
  AND …
;
```

Named placeholders (`:name`) come from the object passed to `dbPost(template, params)`. Pool option: `namedPlaceholders: true`.

## Multi-statement + last result set

The pool enables `multipleStatements: true`. A single file may contain several `SET` / `SELECT` / `INSERT` statements.

`extractDbResult` **pops the last result set** from mysql2’s multi-result array and snake_cases keys to camelCase. Therefore:

- Put the statement whose rows you care about **last**
- Leading `SET` / `SELECT … INTO` statements are fine; they are not what the service receives
- Pure `INSERT`/`UPDATE`/`DELETE` OkPackets normalize to `[]`

## `dbPost` / `dbTransaction`

| Helper | Use |
| --- | --- |
| `dbPost(templatePath, params)` | Usual path; retries transient errors (up to 3); throws `DATABASE_ERR` after failure |
| `dbTransaction(callback)` | Multi-step work on one connection with commit/rollback |

Non-retryable examples: duplicate key, FK violation, syntax/encoding errors.

## Client-generated UUIDs

Creates expect the client to supply an id (validated UUID). SQL typically does `UUID_TO_BIN(:listId)` (or similar) on insert. Tables may also have `DEFAULT (uuid_to_bin(uuid()))`, but the app path should not rely on DB-generated ids for create responses the mobile client already chose.

Validate with `src/shared/uuidValidation.ts` before calling SQL.

## SSL / local vs prod

- **Production:** loads `certs/rds-ca.pem` (`npm run downloadcerts`) and requires SSL
- **Development:** SSL only if `DBSSL=true`

## Practical checklist for a new query

1. Add `src/v2/<domain>/sql/yourQuery.sql` with `SET @…` + final `SELECT`/`DML`
2. Call it from the service with `path.join(__dirname, './sql/yourQuery.sql')`
3. If it is an access check, return `ALLOWED` and wire through `mayProceed`
4. Rebuild so SQL is copied to `build/` (`npm run build` / `copysqlv2`)
