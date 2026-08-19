#!/usr/bin/env node
/**
 * Generate a hand-editable ITEM merge mapping from the current database.
 *
 * Usage (from pantryPlusApiTs root):
 *   npm run item-dedupe:generate
 *   npm run item-dedupe:generate -- --env prod
 *   npm run item-dedupe:generate -- --out schema/item-transforms/mapping.local.json
 *   npm run item-dedupe:generate -- --env prod --fuzzy-max-distance 2
 *
 * `--env prod` loads `.env.prod` (gitignored). Default is `.env`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv } = require('./lib/mysqlEnv');
const { normalizeItemName, groupRecord, clusterFuzzy, loadItems } = require('./lib/itemDedupe');

function parseArgs(argv) {
  const args = { out: path.join('schema', 'item-transforms', 'mapping.local.json'), fuzzyMaxDistance: 2 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--fuzzy-max-distance' && argv[i + 1]) {
      args.fuzzyMaxDistance = Number(argv[i + 1]);
      i += 1;
    }
  }
  return args;
}

function buildGroups(items, fuzzyMaxDistance) {
  const byNormalized = new Map();
  for (const item of items) {
    const key = normalizeItemName(item.name);
    if (!key) continue;
    if (!byNormalized.has(key)) byNormalized.set(key, []);
    byNormalized.get(key).push(item);
  }

  const exactGroups = [];
  const leftover = [];
  for (const members of byNormalized.values()) {
    if (members.length > 1) {
      exactGroups.push(groupRecord({ apply: true, reason: 'exact_normalized', members }));
    } else {
      leftover.push(members[0]);
    }
  }
  exactGroups.sort((a, b) => a.keep_name.localeCompare(b.keep_name));

  const fuzzyGroups = clusterFuzzy(leftover, fuzzyMaxDistance)
    .map((members) => groupRecord({ apply: false, reason: 'fuzzy', members }))
    .sort((a, b) => a.keep_name.localeCompare(b.keep_name));

  return { exactGroups, fuzzyGroups };
}

async function main() {
  const args = parseArgs(loadEnv());
  const conn = await createDbConnection();
  try {
    const items = await loadItems(conn);
    const { exactGroups, fuzzyGroups } = buildGroups(items, args.fuzzyMaxDistance);
    const mapping = {
      generatedAt: new Date().toISOString(),
      fuzzyMaxDistance: args.fuzzyMaxDistance,
      instructions: [
        'Set apply to true to merge a group; false skips it.',
        'keep_id is the surviving ITEM. keep_name is the display casing written onto it.',
        'Remove a member object to leave that ITEM unmerged.',
        'To merge two groups, combine members, pick one keep_id, and set apply true.',
        'Exact groups default to apply true. Fuzzy groups default to apply false.',
      ],
      groups: [...exactGroups, ...fuzzyGroups],
    };

    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(mapping, null, 2)}\n`);

    console.log(`Wrote ${outPath}`);
    console.log(`  items: ${items.length}`);
    console.log(`  exact groups (apply true): ${exactGroups.length}`);
    console.log(`  fuzzy groups (apply false): ${fuzzyGroups.length}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Generate failed:', err.message || err);
  process.exit(1);
});
