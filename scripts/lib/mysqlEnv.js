const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

/**
 * Pull `--env` / `--env-file` out of argv.
 * `--env prod` loads `.env.prod`. Default (development/dev/local) loads `.env`.
 */
function consumeEnvArgs(argv) {
  const rest = [];
  let envName = 'development';
  let envFile = null;
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--env' && argv[i + 1]) {
      envName = argv[i + 1];
      i += 1;
    } else if (argv[i] === '--env-file' && argv[i + 1]) {
      envFile = argv[i + 1];
      i += 1;
    } else {
      rest.push(argv[i]);
    }
  }
  return { envName, envFile, rest };
}

function resolveEnvPath(envName, envFile) {
  if (envFile) {
    return path.resolve(envFile);
  }
  const normalized = envName.trim();
  if (!/^[a-zA-Z0-9_-]+$/.test(normalized)) {
    console.error(`Invalid --env name: ${envName}`);
    process.exit(1);
  }
  if (normalized === 'development' || normalized === 'dev' || normalized === 'local') {
    return path.resolve(process.cwd(), '.env');
  }
  return path.resolve(process.cwd(), `.env.${normalized}`);
}

function loadEnv(argv = process.argv.slice(2)) {
  const { envName, envFile, rest } = consumeEnvArgs(argv);
  const envPath = resolveEnvPath(envName, envFile);
  if (!fs.existsSync(envPath)) {
    console.error(`Env file not found: ${envPath}`);
    console.error('Copy env.prod.example to .env.prod (gitignored) or pass --env-file.');
    process.exit(1);
  }
  const result = dotenv.config({ path: envPath, override: true });
  if (result.error) {
    console.error(`Failed to load ${envPath}: ${result.error.message}`);
    process.exit(1);
  }
  console.log(
    `Using ${envPath} (DBHOST=${process.env.DBHOST} DBUSER=${process.env.DBUSER} DATABASE=${process.env.DATABASE} NODE_ENV=${process.env.NODE_ENV || ''})`
  );
  return rest;
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

async function createDbConnection() {
  return mysql.createConnection({
    host: requireEnv('DBHOST'),
    port: Number(process.env.DBPORT || 3306),
    user: requireEnv('DBUSER'),
    password: requireEnv('DBPASSWORD'),
    database: requireEnv('DATABASE'),
    multipleStatements: true,
    ssl: getSslConfig(),
  });
}

module.exports = { requireEnv, getSslConfig, createDbConnection, loadEnv, consumeEnvArgs };
