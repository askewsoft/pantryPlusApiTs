#!/usr/bin/env node
/**
 * Copy keep_name from a manually edited casing file onto a regenerated one.
 * For every item id in the target file, if that id exists in the source file,
 * replace target keep_name with the source keep_name. Updates the target in place.
 *
 * Usage (from pantryPlusApiTs root):
 *   npm run item-casing:merge-keep-names -- \
 *     schema/item-transforms/casing.prod.original.json \
 *     schema/item-transforms/casing.prod.json
 *
 *   node scripts/item-casing-merge-keep-names.js --from edited.json --into casing.prod.json
 */

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { from: null, into: null, dryRun: false };
  const positionals = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--from' && argv[i + 1]) {
      args.from = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--into' && argv[i + 1]) {
      args.into = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--dry-run') {
      args.dryRun = true;
    } else if (argv[i].startsWith('-')) {
      throw new Error(`Unknown flag: ${argv[i]}`);
    } else {
      positionals.push(argv[i]);
    }
  }
  if (!args.from && positionals[0]) args.from = positionals[0];
  if (!args.into && positionals[1]) args.into = positionals[1];
  if (!args.from || !args.into) {
    throw new Error(
      'Usage: item-casing-merge-keep-names <edited.json> <target.json>\n' +
        '   or: item-casing-merge-keep-names --from edited.json --into target.json [--dry-run]'
    );
  }
  return args;
}

function loadCasing(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }
  const data = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  if (!Array.isArray(data.items)) {
    throw new Error(`Expected items array in ${resolved}`);
  }
  return { resolved, data };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = loadCasing(args.from);
  const target = loadCasing(args.into);

  const keepById = new Map();
  for (const item of source.data.items) {
    if (!item.id) continue;
    if (item.keep_name === undefined || item.keep_name === null) continue;
    keepById.set(item.id, item.keep_name);
  }

  let matched = 0;
  let changed = 0;
  let missingInSource = 0;

  for (const item of target.data.items) {
    if (!item.id) continue;
    if (!keepById.has(item.id)) {
      missingInSource += 1;
      continue;
    }
    matched += 1;
    const next = keepById.get(item.id);
    if (item.keep_name !== next) {
      changed += 1;
      if (!args.dryRun) item.keep_name = next;
    }
  }

  console.log(`Source (edits): ${source.resolved} (${source.data.items.length} items, ${keepById.size} with keep_name)`);
  console.log(`Target:         ${target.resolved} (${target.data.items.length} items)`);
  console.log(`  matched by id: ${matched}`);
  console.log(`  keep_name updated: ${changed}`);
  console.log(`  target ids not in source: ${missingInSource}`);

  if (args.dryRun) {
    console.log('Dry run only; target not written.');
    return;
  }

  fs.writeFileSync(target.resolved, `${JSON.stringify(target.data, null, 2)}\n`);
  console.log(`Wrote ${target.resolved}`);
}

main();
