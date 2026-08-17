const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

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

module.exports = { requireEnv, getSslConfig, createDbConnection };
