#!/usr/bin/env node
/**
 * Apply reviewed ITEM_ALIAS rows. Does not run as part of npm run migrate.
 *
 * Usage:
 *   npm run item-alias:apply -- --dry-run
 *   npm run item-alias:apply -- --env prod --dry-run
 *
 * `--env prod` loads `.env.prod` and reads `aliases.prod.json`.
 * Default is `.env` → `aliases.local.json`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv, transformPath } = require('./lib/mysqlEnv');
const { displayItemName, normalizeItemName } = require('./lib/itemDedupe');

function parseArgs(argv, envName) {
  const args = {
    file: transformPath('aliases', envName),
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

function loadAliases(filePath) {
  const doc = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(doc.aliases)) {
    throw new Error('aliases file must have an aliases array');
  }
  return doc;
}

function plannedRows(doc) {
  return doc.aliases.filter((row) => row.apply === true);
}

function validateRows(rows) {
  for (const [index, row] of rows.entries()) {
    const label = `aliases[${index}]`;
    if (!row.item_id) throw new Error(`${label}: item_id is required`);
    const aliasName = displayItemName(row.alias_name || '');
    if (!aliasName) throw new Error(`${label}: alias_name is required`);
    const aliasNorm = normalizeItemName(aliasName);
    if (row.alias_normalized && row.alias_normalized !== aliasNorm) {
      throw new Error(`${label}: alias_normalized does not match alias_name`);
    }
  }
}

async function main() {
  const { rest, envName } = loadEnv();
  const args = parseArgs(rest, envName);
  const filePath = path.resolve(args.file);
  const doc = loadAliases(filePath);
  const rows = plannedRows(doc);
  validateRows(rows);

  console.log(`Aliases: ${filePath}`);
  console.log(`  total: ${doc.aliases.length}`);
  console.log(`  apply true: ${rows.length}`);

  if (args.dryRun) {
    for (const row of rows) {
      console.log(`  would alias "${displayItemName(row.alias_name)}" → ${row.item_id}`);
    }
    console.log('Dry run only; no database changes.');
    return;
  }

  const conn = await createDbConnection();
  try {
    await conn.beginTransaction();
    let applied = 0;
    for (const row of rows) {
      const aliasName = displayItemName(row.alias_name);
      const aliasNormalized = normalizeItemName(aliasName);
      await conn.query(
        `INSERT INTO ITEM_ALIAS (ALIAS_NORMALIZED, ITEM_ID, ALIAS_NAME)
         VALUES (?, UUID_TO_BIN(?), ?)
         ON DUPLICATE KEY UPDATE
           ITEM_ID = IF(ITEM_ID = UUID_TO_BIN(?), UUID_TO_BIN(?), ITEM_ID),
           ALIAS_NAME = IF(ITEM_ID = UUID_TO_BIN(?), ?, ALIAS_NAME)`,
        [aliasNormalized, row.item_id, aliasName, row.item_id, row.item_id, row.item_id, aliasName]
      );
      applied += 1;
      console.log(`  alias "${aliasName}" → ${row.item_id}`);
    }
    await conn.commit();
    console.log(`Done. Aliases applied: ${applied}`);
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Alias apply failed:', err.message || err);
  process.exit(1);
});
