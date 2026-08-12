-- Records applied schema migrations (filename = id).
-- Managed by `npm run migrate` (scripts/migrate.js).

CREATE TABLE IF NOT EXISTS SCHEMA_MIGRATIONS (
    ID varchar(255) NOT NULL PRIMARY KEY,
    APPLIED_AT datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);
