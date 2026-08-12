# Authorization (`mayProceed`)

Access control is **SQL-driven**, not role enums in TypeScript. Controllers call `mayProceed` with an access template; the template returns a row with `ALLOWED` (camelCased to `allowed`).

```ts
await mayProceed({
  email,                          // from X-Auth-User
  id: resourceId,                 // list / group / shopper / item / category UUID
  accessTemplate: pathToMaySql,   // e.g. mayContributeToList.sql
});
```

- No access → `ErrorCode.NO_ACCESS` → **403**
- Missing email → `ErrorCode.MISSING_IDENTITY` → **401**

Implementation: `src/shared/mayProceed.ts` → `dbPost(accessTemplate, { email, id })`.

## Access templates

| Template | Domain | Who is allowed |
| --- | --- | --- |
| `lists/sql/mayUpdateList.sql` | List metadata (name, group, delete, etc.) | **List owner only** |
| `lists/sql/mayContributeToList.sql` | Items, categories, purchase, reads | List owner, cohort members, **or** cohort owner |
| `groups/sql/mayModifyGroup.sql` | Rename, invite, add/remove members, delete | **Cohort (group) owner only** |
| `groups/sql/mayAccessGroup.sql` | View group / members / invitees | Cohort owner **or** member |
| `shoppers/sql/mayAccessShopper.sql` | Mutate “self” shopper-scoped ops | Caller email matches shopper id |
| `shoppers/sql/maySeeShopperDetails.sql` | Read another shopper | Self, or shared cohort mate / cohort owner |
| `categories/sql/mayModifyCategory.sql` | Category mutate | Same cohort/owner rules as list contribute |
| `items/sql/mayModifyItem.sql` | Item mutate | See file — list/cohort linkage |

When adding an endpoint, pick the template that matches the **business rule** (owner-only vs contribute vs view). Prefer reusing an existing `may*.sql` over inventing ad-hoc checks in the controller.

## API “group” vs DB `COHORT`

OpenAPI and TypeScript say **group**; tables use **`COHORT`**, `COHORT_SHOPPER_RELATION`, `INVITEES`. List sharing is `LIST.COHORT_ID` (exposed as `groupId` in the API). See [Groups & Data Model](./GROUPS_AND_DATA_MODEL.md).

## Controller pattern

1. `@Security("bearerAuth")`
2. Validate UUIDs (`validateUUIDParam` / body validators)
3. `await mayProceed({ … })`
4. Call the domain service (which runs CRUD SQL via `dbPost`)

Creates that do not yet have a resource id often skip `mayProceed` and rely on “caller creates as themselves” SQL (e.g. create shopper / create list as owner).
