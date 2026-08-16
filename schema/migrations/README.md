# Schema migrations

Incremental MySQL DDL for **existing** databases. Applied by `npm run migrate` (`scripts/migrate.js`) or manually in a DB IDE.

**New databases:** use [`../setup.sql`](../setup.sql) only — do not also run migrations. Keep `setup.sql` updated whenever you add a migration file.

Full workflow: [schema/README.md](../README.md).

| File | Change |
| --- | --- |
| [000_schema_migrations.sql](./000_schema_migrations.sql) | Tracking table |
| [001_add_location_created_by.sql](./001_add_location_created_by.sql) | `LOCATION.CREATED_BY` (idempotent) |
| [002_item_name_normalized.sql](./002_item_name_normalized.sql) | `ITEM.NAME_NORMALIZED` + unique index when no dupes (idempotent) |
