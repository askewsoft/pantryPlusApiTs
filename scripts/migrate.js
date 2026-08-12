#!/usr/bin/env node
/**
 * Apply pending SQL files from schema/migrations/ in lexical order.
 *
 * Usage (from repo root, with .env configured):
 *   npm run migrate
 *
 * Existing DB only — do not also run schema/setup.sql for the same install.
 * New databases: apply schema/setup.sql alone (kept in sync with all migrations).
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'schema', 'migrations');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function getSslConfig() {
  const dbssl = process.env.DBSSL;
  const nodeEnv = process.env.NODE_ENV || 'production';
  if (nodeEnv === 'production') {
    const certPath = path.join(process.cwd(), 'certs', 'rds-ca.pem');
    if (!fs.existsSync(certPath)) {
      console.error(`RDS certificate not found at ${certPath}. Run: npm run downloadcerts`);
      process.exit(1);
    }
    return { rejectUnauthorized: true, ca: fs.readFileSync(certPath) };
  }
  if (dbssl === 'true') {
    return {
      rejectUnauthorized: process.env.DBREJECTUNAUTHORIZED === 'true',
    };
  }
  return undefined;
}

function listMigrationFiles() {
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith('.sql'))
    .sort();
}

async function ensureMigrationsTable(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS SCHEMA_MIGRATIONS (
      ID varchar(255) NOT NULL PRIMARY KEY,
      APPLIED_AT datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
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
  const host = requireEnv('DBHOST');
  const user = requireEnv('DBUSER');
  const password = requireEnv('DBPASSWORD');
  const database = requireEnv('DATABASE');
  const port = Number(process.env.DBPORT || 3306);

  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    multipleStatements: true,
    ssl: getSslConfig(),
  });

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
