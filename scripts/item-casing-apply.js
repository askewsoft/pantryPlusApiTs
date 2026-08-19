#!/usr/bin/env node
/**
 * Apply reviewed display casing for unique ITEM rows. Does not merge or delete.
 *
 * Usage (from pantryPlusApiTs root):
 *   npm run item-casing:apply -- --dry-run
 *   npm run item-casing:apply -- --env prod --dry-run
 *
 * `--env prod` loads `.env.prod` (gitignored). Default is `.env`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv } = require('./lib/mysqlEnv');
const { displayItemName, normalizeItemName } = require('./lib/itemDedupe');

function parseArgs(argv) {
  const args = {
    file: path.join('schema', 'item-transforms', 'casing.local.json'),
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

function loadReview(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const review = JSON.parse(raw);
  if (!Array.isArray(review.items)) {
    throw new Error('casing file must have an items array');
  }
  return review;
}

function plannedUpdates(review) {
  const updates = [];
  for (const [index, item] of review.items.entries()) {
    const label = `items[${index}]`;
    if (!item.id) throw new Error(`${label}: id is required`);
    const current = displayItemName(item.name || '');
    const keepName = displayItemName(item.keep_name || '');
    if (!keepName) throw new Error(`${label}: keep_name is required`);
    if (keepName === current) continue;
    updates.push({
      id: item.id,
      from: current,
      keepName,
      nameNormalized: normalizeItemName(keepName),
    });
  }

  const byNormalized = new Map();
  for (const update of updates) {
    if (!byNormalized.has(update.nameNormalized)) byNormalized.set(update.nameNormalized, []);
    byNormalized.get(update.nameNormalized).push(update);
  }
  for (const [key, group] of byNormalized.entries()) {
    if (group.length > 1) {
      throw new Error(`keep_name collides within this file for "${key}": ${group.map((u) => u.id).join(', ')}`);
    }
  }
  return updates;
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
  const args = parseArgs(loadEnv());
  const filePath = path.resolve(args.file);
  const review = loadReview(filePath);
  const updates = plannedUpdates(review);

  console.log(`Casing file: ${filePath}`);
  console.log(`  items in file: ${review.items.length}`);
  console.log(`  casing changes: ${updates.length}`);

  if (args.dryRun) {
    for (const update of updates) {
      console.log(`  would rename ${update.id}: "${update.from}" → "${update.keepName}"`);
    }
    console.log('Dry run only; no database changes.');
    return;
  }

  const conn = await createDbConnection();
  try {
    await conn.beginTransaction();
    let changed = 0;
    for (const update of updates) {
      const n = await applyUpdate(conn, update);
      if (n > 0) {
        changed += 1;
        console.log(`  renamed ${update.id}: "${update.from}" → "${update.keepName}"`);
      }
    }
    await conn.commit();
    console.log(`Done. Names updated: ${changed}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Apply casing failed:', err.message || err);
  process.exit(1);
});
