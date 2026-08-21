#!/usr/bin/env node
/**
 * Apply reviewed display casing for unique ITEM rows. Does not merge or delete.
 *
 * If multiple rows share the same normalized keep_name, or a keep_name is already
 * used by another ITEM in the DB (e.g. a prior dedupe survivor), writes a merge
 * mapping to mapping-casing-collisions.*.json (not mapping.*.json) and exits —
 * run item-dedupe:apply -- --file that path, then regenerate/apply casing.
 *
 * Existing DB rows that already own the target NAME_NORMALIZED are merged into
 * the group and preferred as keep_id (so casing does not invent a second id).
 *
 * Usage (from pantryPlusApiTs root):
 *   npm run item-casing:apply -- --dry-run
 *   npm run item-casing:apply -- --env prod --dry-run
 *
 * `--env prod` loads `.env.prod` and reads `casing.prod.json`.
 * Default is `.env` → `casing.local.json`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv, transformPath } = require('./lib/mysqlEnv');
const {
  displayItemName,
  normalizeItemName,
  loadItems,
  pickCanonical,
  memberRecord,
} = require('./lib/itemDedupe');

function parseArgs(argv, envName) {
  const args = {
    file: transformPath('casing', envName),
    // Separate from mapping.*.json so casing:generate can keep excluding the primary dedupe set.
    mappingOut: transformPath('mapping-casing-collisions', envName),
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--mapping-out' && argv[i + 1]) {
      args.mappingOut = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--dry-run') {
      args.dryRun = true;
    }
  }
  return args;
}

function loadReview(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const review = JSON.parse(raw);
  if (!Array.isArray(review.items)) {
    throw new Error('casing file must have an items array');
  }
  return review;
}

function casingItemToLoaded(item) {
  return {
    id: item.id,
    name: item.name,
    nameNormalized: normalizeItemName(item.name),
    upc: item.upc || null,
    purchaseCount: Number(item.purchases) || 0,
    lastPurchase: item.last_purchase || null,
    placements: item.placements || [],
  };
}

/** Rename candidates from casing file (keep_name differs from name). */
function collectRenameCandidates(review) {
  const candidates = [];
  for (const [index, item] of review.items.entries()) {
    const label = `items[${index}]`;
    if (!item.id) throw new Error(`${label}: id is required`);
    const current = displayItemName(item.name || '');
    const keepName = displayItemName(item.keep_name || '');
    if (!keepName) throw new Error(`${label}: keep_name is required`);
    if (keepName === current) continue;
    candidates.push({
      id: item.id,
      from: current,
      keepName,
      nameNormalized: normalizeItemName(keepName),
      source: item,
    });
  }
  return candidates;
}

/**
 * Split renames into safe updates vs merge groups.
 * A target normalized name needs a merge if:
 * - 2+ casing rows rename to it, or
 * - any other ITEM in the DB already has that NAME_NORMALIZED under MySQL
 *   collation (utf8mb4_0900_ai_ci is accent-insensitive — JS string equality
 *   is not enough; query the DB the same way apply does).
 * Prefer keep_id = existing DB occupant (pickCanonical); else first casing row.
 */
async function planRenames(conn, candidates, catalogById) {
  const byNorm = new Map();
  for (const c of candidates) {
    if (!byNorm.has(c.nameNormalized)) byNorm.set(c.nameNormalized, []);
    byNorm.get(c.nameNormalized).push(c);
  }

  const safeUpdates = [];
  const mergeGroups = [];

  for (const [norm, group] of [...byNorm.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (group.length === 0) continue;

    const casingIds = new Set(group.map((c) => c.id));
    const placeholders = [...casingIds].map(() => 'UUID_TO_BIN(?)').join(', ');
    const [occupantRows] = await conn.query(
      `SELECT BIN_TO_UUID(ID) AS id
       FROM ITEM
       WHERE NAME_NORMALIZED = ?
         AND ID NOT IN (${placeholders})`,
      [norm, ...casingIds]
    );
    const dbOccupants = occupantRows
      .map((row) => catalogById.get(row.id))
      .filter(Boolean);

    // Occupant already has this normalized name; casing rows only need a merge if
    // they still exist as separate ITEM rows (liveCandidates already filtered).
    const needsMerge = group.length > 1 || dbOccupants.length > 0;

    if (!needsMerge) {
      safeUpdates.push({
        id: group[0].id,
        from: group[0].from,
        keepName: group[0].keepName,
        nameNormalized: norm,
      });
      continue;
    }

    const keepName = group[0].keepName;
    const membersById = new Map();
    for (const c of group) {
      const loaded = catalogById.get(c.id) || casingItemToLoaded(c.source);
      membersById.set(c.id, loaded);
    }
    for (const item of dbOccupants) {
      membersById.set(item.id, item);
    }
    const members = [...membersById.values()];

    const keep =
      dbOccupants.length > 0 ? pickCanonical(dbOccupants) : casingItemToLoaded(group[0].source);

    mergeGroups.push({
      apply: true,
      reason: dbOccupants.length > 0 ? 'casing_keep_name_db_collision' : 'casing_keep_name_collision',
      keep_id: keep.id,
      keep_name: keepName,
      members: members.map(memberRecord),
      _norm: norm,
      _dbOccupantCount: dbOccupants.length,
      _casingCount: group.length,
    });
  }

  return { safeUpdates, mergeGroups };
}

function writeCollisionMapping(mappingPath, mergeGroups) {
  const groups = mergeGroups.map(({ apply, reason, keep_id, keep_name, members }) => ({
    apply,
    reason,
    keep_id,
    keep_name,
    members,
  }));

  const mapping = {
    generatedAt: new Date().toISOString(),
    fuzzyMaxDistance: null,
    instructions: [
      'Generated by item-casing:apply because keep_name collides (within file and/or with an existing ITEM NAME_NORMALIZED).',
      'If a DB row already owns that normalized name (e.g. prior dedupe survivor), it is keep_id — do not invent a second id.',
      'Otherwise the first casing row for that keep_name is keep_id (edit if needed).',
      'Run: npm run item-dedupe:apply -- --file schema/item-transforms/mapping-casing-collisions.<env>.json [-- --env prod] [-- --dry-run]',
      'Do not overwrite mapping.<env>.json — casing:generate uses that file to exclude the first-pass dedupe set.',
      'Then regenerate casing and re-apply: item-casing:generate → edit → item-casing:apply.',
      'members[].placements is review-only; ignored by apply.',
    ],
    groups,
  };

  const outPath = path.resolve(mappingPath);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(mapping, null, 2)}\n`);
  return { outPath, groupCount: groups.length, memberCount: groups.reduce((n, g) => n + g.members.length, 0) };
}

async function applyUpdate(conn, update) {
  const [existing] = await conn.query(
    `SELECT BIN_TO_UUID(ID) AS id, NAME AS name
     FROM ITEM
     WHERE NAME_NORMALIZED = ?
       AND ID <> UUID_TO_BIN(?)
     LIMIT 1`,
    [update.nameNormalized, update.id]
  );
  if (existing.length > 0) {
    throw new Error(
      `Cannot rename ${update.id} to "${update.keepName}": normalized name already used by ${existing[0].id}`
    );
  }

  const [result] = await conn.query(
    `UPDATE ITEM
     SET NAME = ?, NAME_NORMALIZED = ?
     WHERE ID = UUID_TO_BIN(?)`,
    [update.keepName, update.nameNormalized, update.id]
  );
  return result.affectedRows || 0;
}

async function main() {
  const { rest, envName } = loadEnv();
  const args = parseArgs(rest, envName);
  const filePath = path.resolve(args.file);
  const review = loadReview(filePath);
  const candidates = collectRenameCandidates(review);

  console.log(`Casing file: ${filePath}`);
  console.log(`  items in file: ${review.items.length}`);
  console.log(`  casing renames: ${candidates.length}`);

  const conn = await createDbConnection();
  let safeUpdates;
  let mergeGroups;
  try {
    const catalog = await loadItems(conn);
    const catalogById = new Map(catalog.map((item) => [item.id, item]));

    const missingFromDb = candidates.filter((c) => !catalogById.has(c.id));
    const liveCandidates = candidates.filter((c) => catalogById.has(c.id));
    if (missingFromDb.length > 0) {
      console.log(
        `  skipped (id not in DB — already merged/deleted): ${missingFromDb.length}`
      );
    }

    ({ safeUpdates, mergeGroups } = await planRenames(conn, liveCandidates, catalogById));

    console.log(`  safe casing changes: ${safeUpdates.length}`);
    console.log(`  merge groups (file and/or DB collision): ${mergeGroups.length}`);

    if (mergeGroups.length > 0) {
      const written = writeCollisionMapping(args.mappingOut, mergeGroups);
      console.log(`Wrote merge mapping: ${written.outPath}`);
      console.log(`  groups: ${written.groupCount} (members: ${written.memberCount})`);
      for (const g of mergeGroups) {
        console.log(
          `  "${g._norm}" → keep ${g.keep_id} "${g.keep_name}" ` +
            `(casing ${g._casingCount}, existing DB ${g._dbOccupantCount}, members ${g.members.length})`
        );
      }
      console.error(
        'Casing apply stopped: keep_name collisions require merge first. Review mapping-casing-collisions, run item-dedupe:apply -- --file <that path>, then item-casing:generate and item-casing:apply again.'
      );
      process.exitCode = 1;
      return;
    }

    if (args.dryRun) {
      for (const update of safeUpdates) {
        console.log(`  would rename ${update.id}: "${update.from}" → "${update.keepName}"`);
      }
      console.log('Dry run only; no database changes.');
      return;
    }

    await conn.beginTransaction();
    let changed = 0;
    for (const update of safeUpdates) {
      const n = await applyUpdate(conn, update);
      if (n > 0) {
        changed += 1;
        console.log(`  renamed ${update.id}: "${update.from}" → "${update.keepName}"`);
      }
    }
    await conn.commit();
    console.log(`Done. Names updated: ${changed}`);
  } catch (err) {
    try {
      await conn.rollback();
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Apply casing failed:', err.message || err);
  process.exit(1);
});
