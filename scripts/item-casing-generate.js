#!/usr/bin/env node
/**
 * Generate a hand-editable casing review file for items that are unique
 * by normalized name (not exact-dupe merge candidates).
 *
 * By default skips any ITEM id that appears in the env-matching merge
 * mapping (keep_id or members) or in mapping-casing-collisions.*.json —
 * those already had keep_name reviewed during dedupe. Also skips names
 * that already contain uppercase letters.
 *
 * Usage (from pantryPlusApiTs root):
 *   npm run item-casing:generate
 *   npm run item-casing:generate -- --env prod
 *
 * `--env prod` loads `.env.prod` and writes `casing.prod.json`
 * (reads `mapping.prod.json`). Default is `.env` → `*.local.json`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv, transformPath } = require('./lib/mysqlEnv');
const { normalizeItemName, loadItems } = require('./lib/itemDedupe');

function parseArgs(argv, envName) {
  const args = {
    out: transformPath('casing', envName),
    from: transformPath('mapping', envName),
    fromCollisions: transformPath('mapping-casing-collisions', envName),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--from' && argv[i + 1]) {
      args.from = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--from-collisions' && argv[i + 1]) {
      args.fromCollisions = argv[i + 1];
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

/** True when display name has no uppercase letters (entirely lowercase). */
function isAllLowercaseName(name) {
  const display = String(name ?? '');
  return display.length > 0 && display === display.toLowerCase();
}

/** ITEM ids already covered by merge mapping (keep_id + every members[].id). */
function collectMappedIds(mapping) {
  const ids = new Set();
  for (const group of mapping.groups || []) {
    if (group.keep_id) ids.add(group.keep_id);
    for (const member of group.members || []) {
      if (member.id) ids.add(member.id);
    }
  }
  return ids;
}

function loadMappedIds(mappingPath, { required = false, label = 'mapping' } = {}) {
  const resolved = path.resolve(mappingPath);
  if (!fs.existsSync(resolved)) {
    if (required) {
      console.log(`No ${label} at ${resolved}; including all unique-name items`);
    } else {
      console.log(`No ${label} at ${resolved}; skipping`);
    }
    return new Set();
  }
  const mapping = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!Array.isArray(mapping.groups)) {
    throw new Error(`mapping file must have a groups array: ${resolved}`);
  }
  const ids = collectMappedIds(mapping);
  console.log(`Excluding ${ids.size} id(s) already in ${resolved}`);
  return ids;
}

function unionIds(...sets) {
  const out = new Set();
  for (const s of sets) {
    for (const id of s) out.add(id);
  }
  return out;
}

async function main() {
  const { rest, envName } = loadEnv();
  const args = parseArgs(rest, envName);
  const mappedIds = unionIds(
    loadMappedIds(args.from, { required: true, label: 'primary mapping' }),
    loadMappedIds(args.fromCollisions, { label: 'casing-collision mapping' })
  );
  const conn = await createDbConnection();
  try {
    const items = await loadItems(conn);
    const singles = uniqueItems(items);
    const notInMapping = singles.filter((item) => !mappedIds.has(item.id));
    const skippedCased = notInMapping.filter((item) => !isAllLowercaseName(item.name));
    const forReview = notInMapping.filter((item) => isAllLowercaseName(item.name));
    const review = {
      generatedAt: new Date().toISOString(),
      instructions: [
        'These items have only one row for their normalized name (not exact-dupe merge candidates).',
        'Ids already listed in mapping.*.json or mapping-casing-collisions.*.json are omitted (dedupe keep_name covered them).',
        'Only all-lowercase display names are included; names with any uppercase letter are skipped.',
        'placements[] lists shopping list + category (null if uncategorized); review-only, ignored by apply.',
        'Edit keep_name to set display casing. Leave keep_name equal to name to skip.',
        'npm run item-casing:apply writes only rows where keep_name differs from name.',
        'Generate this after merge apply when you want casing review of post-merge survivors.',
      ],
      items: forReview.map((item) => ({
        id: item.id,
        name: item.name,
        keep_name: item.name,
        purchases: item.purchaseCount,
        last_purchase: item.lastPurchase,
        upc: item.upc || null,
        placements: item.placements || [],
      })),
    };

    const outPath = path.resolve(args.out);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, `${JSON.stringify(review, null, 2)}\n`);

    console.log(`Wrote ${outPath}`);
    console.log(`  catalog items: ${items.length}`);
    console.log(`  unique-name items: ${singles.length}`);
    console.log(`  excluded (in mapping): ${singles.length - notInMapping.length}`);
    console.log(`  skipped (already has uppercase): ${skippedCased.length}`);
    console.log(`  casing review items: ${forReview.length}`);
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Generate casing failed:', err.message || err);
  process.exit(1);
});
