# PANTRY_PLUS database

MySQL schema for the pantryPlus API.

**Compatibility:** the schema is shared by every live API version and must stay **backward compatible**. Do not drop or rename columns/tables that older `/vN` SQL still uses. Breaking changes belong in a new **API** version paired with a matching mobile app release — not in destructive DDL. See [API Versioning](../docs/API_VERSIONING.md) and [Groups & Data Model](../docs/GROUPS_AND_DATA_MODEL.md).

[DbSchema](https://dbschema.com/) was used to design tables and relationships.

## Diagram

![DB Diagram](pantry_plus_db.png)

## Files

| File | Purpose |
| --- | --- |
| [setup.sql](./setup.sql) | Create tables (idempotent `CREATE TABLE IF NOT EXISTS`) |
| [dropAll.sql](./dropAll.sql) | Tear down (use carefully) |

There is no automated migrations folder today. See [Groups & Data Model](../docs/GROUPS_AND_DATA_MODEL.md) for API↔table naming (group ↔ `COHORT`), ordinals, and evolution notes.

## Apply locally

Point your MySQL client at the instance from `.env`, create the database if needed, then run `setup.sql`. The API connection `DATABASE` should match (typically `PANTRY_PLUS`).
