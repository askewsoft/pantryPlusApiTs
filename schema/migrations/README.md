# Schema migrations

Incremental MySQL DDL for **existing** databases. Applied by `npm run migrate` (`scripts/migrate.js`) or manually in a DB IDE.

**New databases:** use [`../setup.sql`](../setup.sql) only — do not also run migrations. Keep `setup.sql` updated whenever you add a migration file.

Full workflow: [schema/README.md](../README.md).

| File | Change |
| --- | --- |
| [000_schema_migrations.sql](./000_schema_migrations.sql) | Tracking table |
| [001_add_location_created_by.sql](./001_add_location_created_by.sql) | `LOCATION.CREATED_BY` (idempotent) |
| [002_item_name_normalized.sql](./002_item_name_normalized.sql) | `ITEM.NAME_NORMALIZED` + unique index when no dupes (idempotent) |
| [003_item_merge_log.sql](./003_item_merge_log.sql) | `ITEM_MERGE_LOG` audit table |
| [004_item_history_item_name.sql](./004_item_history_item_name.sql) | `ITEM_HISTORY_RELATION.ITEM_NAME` purchase snapshot |
| [005_item_alias.sql](./005_item_alias.sql) | `ITEM_ALIAS` alternate search names |
| [006_drop_uq_item_name_normalized.sql](./006_drop_uq_item_name_normalized.sql) | Drop unique `NAME_NORMALIZED` so v2 can insert duplicate display names |

ITEM consolidation is **not** a migrate step. Generate a mapping, review it, then apply: [`../item-transforms/`](../item-transforms/).
