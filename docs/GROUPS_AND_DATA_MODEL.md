# Groups & Data Model

Glossary for the MySQL schema and how API names map to tables. Diagram: [schema/README.md](../schema/README.md) (`pantry_plus_db.png`). Schema DDL: [schema/setup.sql](../schema/setup.sql).

## Name mapping

| API / mobile | Database |
| --- | --- |
| Shopper / user | `SHOPPER` |
| Group | `COHORT` |
| Group member | `COHORT_SHOPPER_RELATION` |
| Invitee | `INVITEES` (email + `COHORT_ID`) |
| List `groupId` | `LIST.COHORT_ID` |
| Location | `LOCATION` (`GEO_LOCATION` POINT SRID 4326; optional `CREATED_BY`) |

There is no separate “share” table: sharing a list sets `LIST.COHORT_ID`.

## Core entities

| Table | Role |
| --- | --- |
| `SHOPPER` | Identity (`ID` binary UUID, unique `EMAIL`, `NICKNAME`) |
| `COHORT` | Sharing group; `OWNER_ID` → shopper |
| `LIST` | Shopping list; `OWNER_ID`; optional `COHORT_ID` when shared |
| `CATEGORY` | Belongs to a list |
| `ITEM` | Catalog-ish item row; linked to lists/categories via relation tables |
| `LOCATION` | Known store / place with geo point; optional `CREATED_BY` → shopper who created it |
| `LIST_ORDER` | Per-shopper list ordinal |
| `CATEGORY_ORDER` | **Per-location** category ordinal (`CATEGORY_ID` + `LOCATION_ID`) |
| `PURCHASE_HISTORY` / `ITEM_HISTORY_RELATION` | Purchases at a location/date |
| `SCHEMA_MIGRATIONS` | Applied migration filenames (`npm run migrate`) |

## Invite lifecycle

1. Cohort owner invites email → row in `INVITEES`
2. Invitee lists invites via shopper endpoints
3. Accept → membership in `COHORT_SHOPPER_RELATION`, invite removed
4. Decline → invite removed

Owner-only mutations use `mayModifyGroup.sql`. Viewing uses `mayAccessGroup.sql`. List contribution for shared lists uses `mayContributeToList.sql` (owner, members, or cohort owner).

## Location-scoped behavior

- Category order is stored in `CATEGORY_ORDER` keyed by location — hence `X-Auth-Location` on category load/reorder/update and purchase flows.
- Item↔category membership (`ITEM_CATEGORY_RELATION`) is **not** location-scoped today; an item can appear under multiple categories on one list. Enforcing one category per item per list is parked until location-aware placement is designed — see [ONE_CATEGORY_PER_LIST.md](./ONE_CATEGORY_PER_LIST.md).
- Nearby store resolution uses geo queries against `LOCATION` (see locations SQL).
- Creating a location sets `CREATED_BY` when a new row is inserted. Find-or-create within ~50m reuses an existing row and does not change `CREATED_BY`.
- Known / “recent” locations for a shopper are the union of: (1) locations they created, (2) locations created by shoppers who share any cohort with them (member or owner), (3) locations from purchase history on accessible lists within the lookback window. No separate shopper–location junction table.

## Schema evolution

**Principle:** the database must **never** break backward compatibility. All live API versions share one schema; old `src/vN/**/sql` must keep working after every DDL change. The **API** may break only via a new version folder paired with an in-sync mobile app release — see [API Versioning](./API_VERSIONING.md).

| Path | Role |
| --- | --- |
| [schema/setup.sql](../schema/setup.sql) | Full **current** schema for **new** databases only |
| [schema/migrations/](../schema/migrations/) | Incremental DDL for **existing** DBs only (`npm run migrate` or DB IDE) |
| [schema/dropAll.sql](../schema/dropAll.sql) | Wipe (dev only; never run unless explicitly intended) |

Details: [schema/README.md](../schema/README.md). **Never** run setup and migrate for the same install — keep `setup.sql` in sync with every migration.

When changing the model:

1. Prefer **additive** DDL (new nullable columns, new tables, new indexes). Avoid dropping/renaming columns or tightening constraints that older API SQL still depends on.
2. Update `setup.sql` **and** add `schema/migrations/NNN_*.sql` in the same change (setup = greenfield; migration = existing DBs).
3. Prefer idempotent migration DDL; apply on existing environments with `npm run migrate` or a DB IDE (do not re-run `setup.sql` as an upgrade).
4. Keep **each** live version’s SQL templates correct against the expanded schema.
5. If the HTTP contract must break, add `src/vN+1/` (do not break `/vN` or the DB for old clients) and regenerate/publish the matching client for the mobile release that will consume it

Qualified names (`PANTRY_PLUS.TABLE`) appear in some templates; others rely on the connection `DATABASE`. Prefer consistency with neighboring files in the same domain. Migrations run with `DATABASE` from `.env` and typically use unqualified table names.
