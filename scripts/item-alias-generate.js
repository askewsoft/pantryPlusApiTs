#!/usr/bin/env node
/**
 * Propose ITEM_ALIAS rows from reviewed fuzzy merge groups (apply: false).
 * Use when products should stay separate but search together.
 *
 * Usage:
 *   npm run item-alias:generate
 *   npm run item-alias:generate -- --env prod
 *
 * `--env prod` loads `.env.prod` and reads/writes `mapping.prod.json` / `aliases.prod.json`.
 * Default is `.env` → `*.local.json`.
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv, transformPath } = require('./lib/mysqlEnv');
const { displayItemName, normalizeItemName } = require('./lib/itemDedupe');

function parseArgs(argv, envName) {
  const args = {
    from: transformPath('mapping', envName),
    out: transformPath('aliases', envName),
  };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--from' && argv[i + 1]) {
      args.from = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--out' && argv[i + 1]) {
      args.out = argv[i + 1];
      i += 1;
    }
  }
  return args;
}

function loadMapping(filePath) {
  const mapping = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(mapping.groups)) {
    throw new Error('mapping file must have a groups array');
  }
  return mapping;
}

function buildAliasCandidates(groups) {
  const aliases = [];
  for (const group of groups) {
    if (group.reason !== 'fuzzy') continue;
    const keepId = group.keep_id;
    const keepNorm = normalizeItemName(group.keep_name || '');
    for (const member of group.members || []) {
      if (!member.id || member.id === keepId) continue;
      const aliasName = displayItemName(member.name);
      const aliasNorm = normalizeItemName(aliasName);
      if (!aliasNorm || aliasNorm === keepNorm) continue;
      aliases.push({
        apply: false,
        alias_name: aliasName,
        alias_normalized: aliasNorm,
        item_id: keepId,
        canonical_name: displayItemName(group.keep_name),
        source_member_id: member.id,
        source_reason: group.reason,
      });
    }
  }

  const byNorm = new Map();
  for (const row of aliases) {
    if (!byNorm.has(row.alias_normalized)) {
      byNorm.set(row.alias_normalized, row);
    }
  }
  return [...byNorm.values()].sort((a, b) => a.alias_name.localeCompare(b.alias_name));
}

async function filterExisting(conn, candidates) {
  if (candidates.length === 0) return [];
  const norms = candidates.map((c) => c.alias_normalized);
  const placeholders = norms.map(() => '?').join(', ');
  const [itemRows] = await conn.query(
    `SELECT NAME_NORMALIZED AS nameNormalized
     FROM ITEM
     WHERE NAME_NORMALIZED IN (${placeholders})`,
    norms
  );
  const [aliasRows] = await conn.query(
    `SELECT ALIAS_NORMALIZED AS aliasNormalized
     FROM ITEM_ALIAS
     WHERE ALIAS_NORMALIZED IN (${placeholders})`,
    norms
  );
  const blocked = new Set([
    ...itemRows.map((r) => r.nameNormalized),
    ...aliasRows.map((r) => r.aliasNormalized),
  ]);
  return candidates.filter((c) => !blocked.has(c.alias_normalized));
}

async function main() {
  const { rest, envName } = loadEnv();
  const args = parseArgs(rest, envName);
  const fromPath = path.resolve(args.from);
  const mapping = loadMapping(fromPath);
  const candidates = buildAliasCandidates(mapping.groups);

  const conn = await createDbConnection();
  let filtered;
  try {
    filtered = await filterExisting(conn, candidates);
  } finally {
    await conn.end();
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceMapping: fromPath,
    instructions: [
      'Set apply to true to register an alias on apply.',
      'item_id is the canonical ITEM that the alias resolves to.',
      'Generated from fuzzy merge groups (apply false). Does not merge rows.',
      'Run item-dedupe:generate first if the mapping file is missing.',
    ],
    aliases: filtered,
  };

  const outPath = path.resolve(args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`);

  console.log(`Wrote ${outPath}`);
  console.log(`  fuzzy alias candidates: ${candidates.length}`);
  console.log(`  after excluding existing names: ${filtered.length}`);
}

main().catch((err) => {
  console.error('Alias generate failed:', err.message || err);
  process.exit(1);
});
