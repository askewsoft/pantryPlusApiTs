# Item transforms — merge mapping, aliases, and casing review

Do **not** auto-merge or auto-alias via `npm run migrate`. Consolidation is reviewed mapping files plus apply scripts. **Runtime find-or-create never fuzzy-merges** — only exact normalized names and reviewed `ITEM_ALIAS` rows resolve.

## Exact + fuzzy merge (#143)

1. Ensure migrations `003_item_merge_log.sql` and `005_item_alias.sql` have been applied (`npm run migrate`).
2. Generate candidates:

```sh
npm run item-dedupe:generate
npm run item-dedupe:generate -- --env prod
```

`--env prod` uses gitignored `.env.prod` (template: [`env.prod.example`](../../env.prod.example)). Default is `.env`. These scripts connect **directly to MySQL**, not the HTTP API. Production (`NODE_ENV=production` in `.env.prod`) requires `certs/rds-ca.pem` (`npm run downloadcerts`) and a security group / user that allows your client IP.

Writes [`mapping.local.json`](./mapping.local.json) (gitignored). Optional:

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
# edit schema/item-transforms/aliases.local.json — set apply true on desired rows
npm run item-alias:apply -- --dry-run
npm run item-alias:apply
```

Generate reads fuzzy groups (`apply: false`) from `mapping.local.json` and proposes alias rows from non-keeper member names → `keep_id`. See [`aliases.example.json`](./aliases.example.json).

| Field | Meaning |
| --- | --- |
| `apply` | Register this alias on apply |
| `alias_name` | Text shoppers type or speak |
| `item_id` | Canonical ITEM the alias resolves to |
| `canonical_name` | Reference only (from mapping) |

Runtime: `POST /items` (find-or-create) and typeahead corpus resolve reviewed aliases. API: `GET/POST/DELETE /items/{id}/aliases`.

## Casing review (unique items)

Items that already have a single row for their normalized name are **not** in the merge mapping. Generate a separate review file, edit `keep_name`, then apply. Best after merge so you review post-merge survivors once.

```sh
npm run item-casing:generate
# edit schema/item-transforms/casing.local.json — change keep_name where casing should change
npm run item-casing:apply -- --dry-run
npm run item-casing:apply
```

See [`casing.example.json`](./casing.example.json). Apply writes only rows where `keep_name` differs from `name`. Unchanged rows are skipped. A rename that collides with another item's normalized name is rejected.

| Field | Meaning |
| --- | --- |
| `id` | ITEM id |
| `name` | Current display name (leave as-is for comparison) |
| `keep_name` | Desired display casing; edit this |

## Mapping shape

See [`mapping.example.json`](./mapping.example.json).

| Field | Meaning |
| --- | --- |
| `apply` | Whether this group is merged on apply |
| `reason` | `exact_normalized` (same folded name) or `fuzzy` (edit distance / token-sort) |
| `keep_id` | Canonical ITEM id (must be one of `members[].id`) |
| `keep_name` | Display name stored on the canonical row |
| `members` | All ITEM rows in the group, including the keeper |

Suggested canonical (you can override): most purchases → most recent purchase → longest name → name ASC → id ASC.

## Optional SQL inventory

Read-only helpers for DataGrip / `mysql` (not migrate, not apply):

| File | Purpose |
| --- | --- |
| [01_list_items_alpha.sql](./01_list_items_alpha.sql) | All items A–Z, case-insensitive |
| [02_identify_normalized_dupes.sql](./02_identify_normalized_dupes.sql) | Groups sharing `NAME_NORMALIZED` |
| [03_dry_run_merge_mapping.sql](./03_dry_run_merge_mapping.sql) | SQL view of exact/case-only ranking |
