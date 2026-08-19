#!/usr/bin/env node
/**
 * Apply pending SQL files from schema/migrations/ in lexical order.
 *
 * Usage (from repo root):
 *   npm run migrate
 *   npm run migrate -- --env prod
 *
 * `--env prod` loads `.env.prod` (gitignored). Default is `.env`.
 *
 * Existing DB only — do not also run schema/setup.sql for the same install.
 * New databases: apply schema/setup.sql alone (kept in sync with all migrations).
 */

const fs = require('fs');
const path = require('path');
const { createDbConnection, loadEnv } = require('./lib/mysqlEnv');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'schema', 'migrations');

function listMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS SCHEMA_MIGRATIONS (
      ID VARCHAR(255) NOT NULL,
      APPLIED_AT DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (ID)
    )
  `);
}

async function getAppliedIds(conn) {
  const [rows] = await conn.query('SELECT ID FROM SCHEMA_MIGRATIONS');
  return new Set(rows.map((r) => r.ID));
}

async function applyMigration(conn, filename) {
  const fullPath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(fullPath, 'utf8');
  console.log(`Applying ${filename}…`);
  await conn.query(sql);
  await conn.query('INSERT INTO SCHEMA_MIGRATIONS (ID) VALUES (?)', [filename]);
  console.log(`  ✓ ${filename}`);
}

async function main() {
  loadEnv();
  const conn = await createDbConnection();

  try {
    await ensureMigrationsTable(conn);
    const applied = await getAppliedIds(conn);
    const files = listMigrationFiles();

    if (files.length === 0) {
      console.log('No migration files found.');
      return;
    }

    let pending = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skip (already applied): ${file}`);
        continue;
      }
      await applyMigration(conn, file);
      pending += 1;
    }

    if (pending === 0) {
      console.log('Schema is up to date.');
    } else {
      console.log(`Applied ${pending} migration(s).`);
    }
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
