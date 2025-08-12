import { logger, Logger } from './logger';
import { ErrorCode } from './errorHandler';
import mysql, { PoolOptions, RowDataPacket, Pool } from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { snakeToCamel } from './camelCaseKeys';
import config from './config';
import getFileName from './getFileName';
import path from 'path';
import process from 'process';
import fs from 'fs';
const log: Logger = logger('dbDriver');

const extractQuery = async (template: string): Promise<string> => {
  try {
    const sqlFile = await readFile(template, 'utf8');
    return processSqlFile(sqlFile);
  } catch (error: any) {
    log.error({
      error: 'Failed to read SQL file',
      template,
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

const processSqlFile = (sqlFile: string): string => {
  return sqlFile
    .replace(/\/\*[\s\S]*?\*\/|\-\-.*/g, '')
    .replace(/\s{1,}/g, ' ')
    .trim()
    .replace(/\s,/g, ',');
};

const getSslConfig = () => {
  if (config.node_env === 'production') {
    try {
      const certPath = path.join(process.cwd(), 'certs', 'rds-ca.pem');

      if (!fs.existsSync(certPath)) {
        const err = new Error('RDS certificate not found at ' + certPath) as any;
        err.name = ErrorCode.DATABASE_ERR;
        throw err;
      }

      const cert = fs.readFileSync(certPath);
      const stats = fs.statSync(certPath);

      log.info({ message: 'Successfully loaded RDS certificate', certPath, certSize: stats.size});
      return { rejectUnauthorized: true, ca: cert };
    } catch (error: any) {
      log.error({ message: 'Failed to load RDS certificate', error: error.message, stack: error.stack });
      throw error;
    }
  }
  // For local development, use basic SSL config or false if connecting to local Docker
  return config.dbssl === 'true' ? { rejectUnauthorized: config.dbrejectunauthorized } : undefined;
};

const sqlConnectOpts: PoolOptions = {
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpassword,
  database: config.database,
  multipleStatements: true,
  ssl: getSslConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  charset: 'utf8',
  connectTimeout: 20000,
};

// Log database connection configuration (excluding sensitive data)
log.info({
  message: 'Database Connection Config',
  host: config.dbhost,
  database: config.database,
  ssl: config.dbssl,
  rejectUnauthorized: config.dbrejectunauthorized,
  connectTimeout: sqlConnectOpts.connectTimeout
});

let pool: Pool | null = null;

async function getPool(): Promise<Pool> {
  if (!pool) {
    try {
      pool = mysql.createPool(sqlConnectOpts);

      // Add event listeners for better debugging
      pool.on('acquire', (connection) => {
        log.debug('Connection acquired', { threadId: connection.threadId });
      });

      pool.on('enqueue', () => {
        log.warn('Waiting for available connection slot');
      });

      pool.on('release', (connection) => {
        log.debug('Connection released', { threadId: connection.threadId });
      });

      // Test the connection
      const conn = await pool.getConnection();
      log.debug('Initial connection test successful');
      conn.release();
    } catch (err: any) {
      log.error({
        message: 'Failed to create connection pool',
        error: err.message,
        code: err.code,
        errno: err.errno,
        sqlState: err.sqlState,
        stack: err.stack
      });
      throw err;
    }
  }
  return pool;
}

// dbPost returns a promise
const dbPost = async (template: string, params: Object, debug: boolean = false): Promise<any> => {
  const startQueryTime = Date.now();
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const sqlStr = await extractQuery(template);
      const pool = await getPool();
      const dbConn = await pool.getConnection();

      try {
        const [rows] = await dbConn.query(sqlStr, params);
        const results = extractDbResult(rows, debug);
        const endQueryTime = Date.now();
        const duration = `${endQueryTime - startQueryTime}ms`;
        log.debug({ message: 'Query successful', template: getFileName(template), duration, attempt });
        return results;
      } finally {
        dbConn.release();
      }
    } catch (err: any) {
      lastError = err;
      log.error({
        message: 'Database operation failed',
        attempt,
        errorName: err.name,
        errorMessage: err.message,
        errorCode: err.code,
        errorNumber: err.errno,
        sqlState: err.sqlState,
        sqlMessage: err.sqlMessage,
        template: getFileName(template),
        params: JSON.stringify(params),
        stack: err.stack
      });

      // Check if this is a non-retryable error
      if (isNonRetryableError(err)) {
        log.debug(`Non-retryable error detected, not retrying: ${err.message}`);
        break;
      }

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * attempt, 3000); // Progressive delay: 1s, 2s, 3s
        log.debug(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If we get here, all retries failed
  const errObj = new Error('Database operation failed after all retries') as any;
  errObj.name = ErrorCode.DATABASE_ERR;
  errObj.originalError = lastError;
  throw errObj;
};

/**
 * Determines if an error is non-retryable
 */
function isNonRetryableError(err: any): boolean {
  // Encoding/character set errors are never transient
  if (err.errno === 3854) return true; // ER_CANNOT_CONVERT_STRING

  // Syntax errors are never transient
  if (err.errno === 1064) return true; // ER_PARSE_ERROR

  // Data type errors are never transient
  if (err.errno === 1366) return true; // ER_TRUNCATED_WRONG_VALUE

  // Constraint violations are never transient
  if (err.errno === 1062) return true; // ER_DUP_ENTRY
  if (err.errno === 1452) return true; // ER_NO_REFERENCED_ROW_2

  // Authentication/authorization errors are never transient
  if (err.errno === 1045) return true; // ER_ACCESS_DENIED_ERROR
  if (err.errno === 1142) return true; // ER_TABLEACCESS_DENIED_ERROR

  // Network/connection errors might be transient (retry these)
  // Timeout errors might be transient (retry these)
  // Deadlock errors might be transient (retry these)

  return false;
}

// returns the array of results w/o all the MySQL wrapping
const extractDbResult = (rows: any, debug: boolean = false): Array<any> | undefined => {
  if (Array.isArray(rows) && rows.length > 0) {
    const results = rows.pop();
    if (debug) {
      console.log('results:', JSON.stringify(results));
    }
    const normalizedResults = snakeToCamel(results);
    return Array.isArray(normalizedResults) ? normalizedResults : [normalizedResults];
  } else {
    const errObj = new Error('invalid database response') as any;
    errObj.name = ErrorCode.DATABASE_ERR;
    log.error(errObj);
    throw errObj;
  }
};

export { dbPost };