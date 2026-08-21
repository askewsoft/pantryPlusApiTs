# Item transforms — merge mapping, aliases, and casing review

Do **not** auto-merge or auto-alias via `npm run migrate`. Consolidation is reviewed mapping files plus apply scripts. **Runtime find-or-create never fuzzy-merges** — only exact normalized names and reviewed `ITEM_ALIAS` rows resolve.

## Recommended order

Run transforms in this sequence (each env separately: default local, or `--env prod`):

1. **`item-dedupe:generate` → review → `item-dedupe:apply`** — merge exact/fuzzy duplicate ITEM rows.
2. **`item-casing:generate` → edit `keep_name` → `item-casing:apply`** — fix display casing on remaining unique names (all-lowercase only).
3. **`item-alias:generate` → review → `item-alias:apply`** (optional) — aliases for fuzzy pairs you chose not to merge.

**Dependency:** casing assumes the primary merge pass is done. Primary results stay in `mapping.*.json` (casing generate excludes those ids). If several casing rows share the same normalized `keep_name`, **or** a `keep_name` is already owned by another ITEM in the database (e.g. a prior dedupe survivor skipped by casing generate because it already had uppercase), `item-casing:apply` **does not rename**. It writes a **second** merge file — `mapping-casing-collisions.*.json` — and exits non-zero. That keeps `mapping.*.json` intact for exclusion on the next casing generate.

- `reason: casing_keep_name_collision` — 2+ casing rows only; first casing row = `keep_id`
- `reason: casing_keep_name_db_collision` — target `NAME_NORMALIZED` already exists on a DB row not only in the casing set (including accent-insensitive MySQL matches such as `crème` vs `creme`); **that existing row is preferred as `keep_id`**

```sh
# after casing apply wrote mapping-casing-collisions.prod.json
npm run item-dedupe:apply -- --env prod --file schema/item-transforms/mapping-casing-collisions.prod.json --dry-run
npm run item-dedupe:apply -- --env prod --file schema/item-transforms/mapping-casing-collisions.prod.json
npm run item-casing:generate -- --env prod
# re-edit keep_name as needed
npm run item-casing:apply -- --env prod --dry-run
```

Optional `--mapping-out path` on casing apply overrides the collision mapping path. Casing generate also excludes ids from `mapping-casing-collisions.*.json` when that file exists (`--from-collisions` to override).

## Exact + fuzzy merge (#143)

1. Ensure migrations `003_item_merge_log.sql` and `005_item_alias.sql` have been applied (`npm run migrate`).
2. Generate candidates:

```sh
npm run item-dedupe:generate
npm run item-dedupe:generate -- --env prod
```

`--env prod` uses gitignored `.env.prod` (template: [`env.prod.example`](../../env.prod.example)). Default is `.env`. These scripts connect **directly to MySQL**, not the HTTP API. Production (`NODE_ENV=production` in `.env.prod`) requires `certs/rds-ca.pem` (`npm run downloadcerts`) and a security group / user that allows your client IP.

Writes [`mapping.local.json`](./mapping.local.json) by default (gitignored), or `mapping.prod.json` with `--env prod`. Optional:

```sh
npm run item-dedupe:generate -- --out schema/item-transforms/mapping.local.json --fuzzy-max-distance 2
```

3. Edit the file:
   - `apply: true` merges the group; `false` skips it.
   - `keep_id` is the surviving ITEM.
   - `keep_name` is the display casing written onto the survivor (change this to pick capitalization).
   - Remove a `members[]` object to leave that ITEM as its own product.
   - To merge fuzzy matches, set that group's `apply` to `true`, or combine members from two groups into one and pick a single `keep_id`.
4. Dry-run, then apply merges:

```sh
npm run item-dedupe:apply -- --dry-run
npm run item-dedupe:apply
npm run item-dedupe:apply -- --env prod --dry-run
```

Apply re-points FKs with collision-safe `INSERT IGNORE`, migrates `ITEM_ALIAS` rows, writes `ITEM_MERGE_LOG`, deletes loser `ITEM` rows, and adds `uq_item_name_normalized` if no duplicates remain.

Exact groups default to `apply: true`. **Fuzzy groups default to `apply: false`** — opt in after review.

## Aliases instead of merge (#165)

When fuzzy pairs should **stay separate products** but search together (e.g. coke → Coca-Cola):

```sh
npm run item-alias:generate
npm run item-alias:generate -- --env prod
# edit aliases.local.json / aliases.prod.json — set apply true on desired rows
npm run item-alias:apply -- --dry-run
npm run item-alias:apply -- --env prod --dry-run
```

Generate reads fuzzy groups from the env-matching mapping file (`mapping.local.json` or `mapping.prod.json`) and proposes alias rows from non-keeper member names → `keep_id`. See [`aliases.example.json`](./aliases.example.json).

| Field | Meaning |
| --- | --- |
| `apply` | Register this alias on apply |
| `alias_name` | Text shoppers type or speak |
| `item_id` | Canonical ITEM the alias resolves to |
| `canonical_name` | Reference only (from mapping) |

Runtime: `POST /items` (find-or-create) and typeahead corpus resolve reviewed aliases. API: `GET/POST/DELETE /items/{id}/aliases`.

## Casing review (unique items)

Items that already have a single row for their normalized name are **not** merge candidates. Generate a separate review file, edit `keep_name`, then apply. Best after merge so you review remaining unique names once.

Generate **omits any ITEM id that appears in** `mapping.*.json` **or** `mapping-casing-collisions.*.json` (`keep_id` or `members`) — those already had display casing chosen via dedupe `keep_name`. It also **only includes all-lowercase display names** (any uppercase letter → skipped). Optional `--from` / `--from-collisions` override those paths.

`placements` on each row (and on mapping `members`) is **review-only** — list name + category name (`null` if on the list but uncategorized). Apply scripts ignore it.

```sh
npm run item-casing:generate
npm run item-casing:generate -- --env prod
# optional: copy keep_name from a previous review onto a regenerated file (match by id)
npm run item-casing:merge-keep-names -- schema/item-transforms/casing.prod.original.json schema/item-transforms/casing.prod.json
# edit casing.local.json / casing.prod.json — change keep_name where casing should change
npm run item-casing:apply -- --dry-run
npm run item-casing:apply -- --env prod --dry-run
```

See [`casing.example.json`](./casing.example.json). Apply writes only rows where `keep_name` differs from `name`. Unchanged rows are skipped. A rename that collides with another item's normalized name **in the same file** writes a merge mapping and stops (see [Recommended order](#recommended-order)). A rename that collides with a different ITEM already in the database is rejected.

| Field | Meaning |
| --- | --- |
| `id` | ITEM id |
| `name` | Current display name (leave as-is for comparison) |
| `keep_name` | Desired display casing; edit this |
| `placements` | Review-only: `{ list, category }` associations |

## Mapping shape

See [`mapping.example.json`](./mapping.example.json).

| Field | Meaning |
| --- | --- |
| `apply` | Whether this group is merged on apply |
| `reason` | `exact_normalized` (same folded name) or `fuzzy` (edit distance / token-sort) |
| `keep_id` | Canonical ITEM id (must be one of `members[].id`) |
| `keep_name` | Display name stored on the canonical row |
| `members` | All ITEM rows in the group, including the keeper |
| `members[].placements` | Review-only: `{ list, category }` associations |

Suggested canonical (you can override): most purchases → most recent purchase → longest name → name ASC → id ASC.

## Optional SQL inventory

Read-only helpers for DataGrip / `mysql` (not migrate, not apply):

| File | Purpose |
| --- | --- |
| [01_list_items_alpha.sql](./01_list_items_alpha.sql) | All items A–Z, case-insensitive |
| [02_identify_normalized_dupes.sql](./02_identify_normalized_dupes.sql) | Groups sharing `NAME_NORMALIZED` |
| [03_dry_run_merge_mapping.sql](./03_dry_run_merge_mapping.sql) | SQL view of exact/case-only ranking |
