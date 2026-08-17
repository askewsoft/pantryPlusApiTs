#!/usr/bin/env node
/**
 * Generate a hand-editable casing review file for items that are unique
 * by normalized name (not exact-dupe merge candidates).
 *
 * Usage (from pantryPlusApiTs root, with .env):
 *   npm run item-casing:generate
 *   npm run item-casing:generate -- --out schema/item-transforms/casing.local.json
 *
 * Prefer running this after merge apply so survivors of merges are included once.
 * Edit keep_name; apply writes only where keep_name differs from name.
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createDbConnection } = require('./lib/mysqlEnv');
const { normalizeItemName, loadItems } = require('./lib/itemDedupe');

function parseArgs(argv) {
  const args = { out: path.join('schema', 'item-transforms', 'casing.local.json') };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function uniqueItems(items) {
  const byNormalized = new Map();
  for (const item of items) {
    const key = normalizeItemName(item.name);
    if (!key) continue;
    if (!byNormalized.has(key)) byNormalized.set(key, []);
    byNormalized.get(key).push(item);
  }
  const singles = [];
  for (const members of byNormalized.values()) {
    if (members.length === 1) singles.push(members[0]);
  }
  singles.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return singles;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const conn = await createDbConnection();
  try {
    const items = await loadItems(conn);
    const singles = uniqueItems(items);
    const review = {
      generatedAt: new Date().toISOString(),
      instructions: [
        'These items have only one row for their normalized name (not exact-dupe merge candidates).',
        'Edit keep_name to set display casing. Leave keep_name equal to name to skip.',
        'npm run item-casing:apply writes only rows where keep_name differs from name.',
        'Generate this after merge apply when you want casing review of post-merge survivors.',
      ],
      items: singles.map((item) => ({
        id: item.id,
        name: item.name,
        keep_name: item.name,
        purchases: item.purchaseCount,
        last_purchase: item.lastPurchase,
        upc: item.upc || null,
      })),
    };

    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(review, null, 2)}\n`);

    console.log(`Wrote ${outPath}`);
    console.log(`  catalog items: ${items.length}`);
    console.log(`  unique-name items for casing review: ${singles.length}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Generate casing failed:', err.message || err);
  process.exit(1);
});
