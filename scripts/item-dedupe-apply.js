#!/usr/bin/env node
/**
 * Apply a reviewed ITEM merge mapping. Does not run as part of npm run migrate.
 *
 * Usage (from pantryPlusApiTs root):
 *   npm run item-dedupe:apply -- --dry-run
 *   npm run item-dedupe:apply -- --env prod --dry-run
 *   npm run item-dedupe:apply
 *   npm run item-dedupe:apply -- --env prod
 *
 * `--env prod` loads `.env.prod` and reads `mapping.prod.json`.
 * Default is `.env` → `mapping.local.json`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv, transformPath } = require('./lib/mysqlEnv');
const { displayItemName, normalizeItemName } = require('./lib/itemDedupe');

function parseArgs(argv, envName) {
  const args = {
    file: transformPath('mapping', envName),
    dryRun: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--file' && argv[i + 1]) {
      args.file = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--dry-run') {
      args.dryRun = true;
    }
  }
  return args;
}

function loadMapping(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const mapping = JSON.parse(raw);
  if (!Array.isArray(mapping.groups)) {
    throw new Error('mapping file must have a groups array');
  }
  return mapping;
}

function plannedGroups(mapping) {
  return mapping.groups.filter((g) => g.apply === true);
}

function validateGroups(groups) {
  const keepIds = new Set();
  const loserIds = new Set();
  for (const [index, group] of groups.entries()) {
    const label = `groups[${index}]`;
    if (!group.keep_id) throw new Error(`${label}: keep_id is required`);
    const keepName = displayItemName(group.keep_name || '');
    if (!keepName) throw new Error(`${label}: keep_name is required`);
    if (!Array.isArray(group.members) || group.members.length === 0) {
      throw new Error(`${label}: members must be a non-empty array`);
    }
    const memberIds = group.members.map((m) => m.id).filter(Boolean);
    if (!memberIds.includes(group.keep_id)) {
      throw new Error(`${label}: keep_id must be one of members[].id`);
    }
    if (keepIds.has(group.keep_id) || loserIds.has(group.keep_id)) {
      throw new Error(`${label}: keep_id ${group.keep_id} already used in another applied group`);
    }
    keepIds.add(group.keep_id);
    for (const id of memberIds) {
      if (id === group.keep_id) continue;
      if (keepIds.has(id) || loserIds.has(id)) {
        throw new Error(`${label}: member ${id} already used in another applied group`);
      }
      loserIds.add(id);
    }
  }
}

async function applyGroup(conn, group) {
  const keepId = group.keep_id;
  const keepName = displayItemName(group.keep_name);
  const nameNormalized = normalizeItemName(keepName);
  const reason = String(group.reason || 'reviewed').slice(0, 64);
  const loserIds = group.members.map((m) => m.id).filter((id) => id && id !== keepId);

  await conn.query(
    `UPDATE ITEM
     SET NAME = ?, NAME_NORMALIZED = ?
     WHERE ID = UUID_TO_BIN(?)`,
    [keepName, nameNormalized, keepId]
  );

  if (loserIds.length === 0) return { keepId, keepName, losers: 0 };

  const placeholders = loserIds.map(() => 'UUID_TO_BIN(?)').join(', ');

  await conn.query(
    `UPDATE ITEM canonical
     INNER JOIN (
       SELECT UUID_TO_BIN(?) AS canonical_id,
              SUBSTRING(MAX(CONCAT(IF(loser.UPC IS NULL OR loser.UPC = '', '', '1'), COALESCE(loser.UPC, ''))), 2) AS upc
       FROM ITEM loser
       WHERE loser.ID IN (${placeholders})
     ) src ON src.canonical_id = canonical.ID
     SET canonical.UPC = NULLIF(src.upc, '')
     WHERE (canonical.UPC IS NULL OR canonical.UPC = '')
       AND src.upc IS NOT NULL
       AND src.upc <> ''`,
    [keepId, ...loserIds]
  );

  await conn.query(
    `INSERT IGNORE INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
     SELECT lir.LIST_ID, UUID_TO_BIN(?)
     FROM LIST_ITEM_RELATION lir
     WHERE lir.ITEM_ID IN (${placeholders})`,
    [keepId, ...loserIds]
  );
  await conn.query(
    `DELETE FROM LIST_ITEM_RELATION WHERE ITEM_ID IN (${placeholders})`,
    loserIds
  );

  await conn.query(
    `INSERT IGNORE INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
     SELECT UUID_TO_BIN(?), icr.CATEGORY_ID
     FROM ITEM_CATEGORY_RELATION icr
     WHERE icr.ITEM_ID IN (${placeholders})`,
    [keepId, ...loserIds]
  );
  await conn.query(
    `DELETE FROM ITEM_CATEGORY_RELATION WHERE ITEM_ID IN (${placeholders})`,
    loserIds
  );

  await conn.query(
    `INSERT IGNORE INTO ITEM_HISTORY_RELATION (ITEM_ID, PURCHASE_HISTORY_ID, PURCHASED_BY, CATEGORY_NAME, ITEM_NAME)
     SELECT UUID_TO_BIN(?), ihr.PURCHASE_HISTORY_ID, ihr.PURCHASED_BY, ihr.CATEGORY_NAME, ihr.ITEM_NAME
     FROM ITEM_HISTORY_RELATION ihr
     WHERE ihr.ITEM_ID IN (${placeholders})`,
    [keepId, ...loserIds]
  );
  await conn.query(
    `DELETE FROM ITEM_HISTORY_RELATION WHERE ITEM_ID IN (${placeholders})`,
    loserIds
  );

  await conn.query(
    `INSERT IGNORE INTO ITEM_ALIAS (ALIAS_NORMALIZED, ITEM_ID, ALIAS_NAME)
     SELECT ia.ALIAS_NORMALIZED, UUID_TO_BIN(?), ia.ALIAS_NAME
     FROM ITEM_ALIAS ia
     WHERE ia.ITEM_ID IN (${placeholders})`,
    [keepId, ...loserIds]
  );
  await conn.query(
    `DELETE FROM ITEM_ALIAS WHERE ITEM_ID IN (${placeholders})`,
    loserIds
  );

  const logRows = loserIds.map((loserId) => [loserId, keepId, reason]);
  await conn.query(
    `INSERT INTO ITEM_MERGE_LOG (LOSER_ID, CANONICAL_ID, REASON)
     VALUES ${logRows.map(() => '(UUID_TO_BIN(?), UUID_TO_BIN(?), ?)').join(', ')}`,
    logRows.flat()
  );

  await conn.query(
    `DELETE FROM ITEM WHERE ID IN (${placeholders})`,
    loserIds
  );

  return { keepId, keepName, losers: loserIds.length };
}

async function addUniqueIndexIfPossible(conn) {
  const [idxRows] = await conn.query(
    `SELECT COUNT(*) AS n
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'ITEM'
       AND INDEX_NAME = 'uq_item_name_normalized'`
  );
  if (Number(idxRows[0].n) > 0) {
    console.log('uq_item_name_normalized already present');
    return;
  }

  const [dupRows] = await conn.query(
    `SELECT COUNT(*) AS n FROM (
       SELECT NAME_NORMALIZED
       FROM ITEM
       WHERE NAME_NORMALIZED IS NOT NULL
       GROUP BY NAME_NORMALIZED
       HAVING COUNT(*) > 1
     ) d`
  );
  if (Number(dupRows[0].n) > 0) {
    console.log(`Skipping unique index: ${dupRows[0].n} duplicate NAME_NORMALIZED value(s) remain`);
    return;
  }

  await conn.query('ALTER TABLE ITEM ADD UNIQUE KEY uq_item_name_normalized (NAME_NORMALIZED)');
  console.log('Added uq_item_name_normalized');
}

async function main() {
  const { rest, envName } = loadEnv();
  const args = parseArgs(rest, envName);
  const filePath = path.resolve(args.file);
  const mapping = loadMapping(filePath);
  const groups = plannedGroups(mapping);
  validateGroups(groups);

  console.log(`Mapping: ${filePath}`);
  console.log(`  total groups: ${mapping.groups.length}`);
  console.log(`  apply true: ${groups.length}`);
  if (args.dryRun) {
    for (const group of groups) {
      const losers = group.members.filter((m) => m.id !== group.keep_id);
      console.log(
        `  would merge ${losers.length} → ${group.keep_id} as "${displayItemName(group.keep_name)}" (${group.reason || 'reviewed'})`
      );
    }
    console.log('Dry run only; no database changes.');
    return;
  }

  const conn = await createDbConnection();
  try {
    await conn.beginTransaction();
    let mergedLosers = 0;
    for (const group of groups) {
      const result = await applyGroup(conn, group);
      mergedLosers += result.losers;
      console.log(`  merged ${result.losers} → ${result.keepId} as "${result.keepName}"`);
    }
    await addUniqueIndexIfPossible(conn);
    await conn.commit();
    console.log(`Done. Loser rows merged: ${mergedLosers}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Apply failed:', err.message || err);
  process.exit(1);
});
