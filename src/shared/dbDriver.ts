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
    // Add debug logging for path information
    log.debug({
      message: 'Attempting to read SQL file',
      template,
      __dirname: __dirname,
      cwd: process.cwd(),
      absolutePath: path.resolve(template),
      exists: fs.existsSync(template)
    });

    const sqlFile = await readFile(template, 'utf8');
    
    // Log successful read
    log.debug({
      message: 'Successfully read SQL file',
      template,
      contentLength: sqlFile.length
    });

    return processSqlFile(sqlFile);
  } catch (error: any) {
    // Enhanced error logging
    log.error({
      error: 'Failed to read SQL file',
      template,
      message: error.message,
      stack: error.stack,
      __dirname: __dirname,
      cwd: process.cwd(),
      absolutePath: path.resolve(template),
      dirExists: fs.existsSync(path.dirname(template)),
      dirContents: fs.existsSync(path.dirname(template)) ? 
        fs.readdirSync(path.dirname(template)) : 'directory not found'
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
    log.info('Using RDS certificate for production environment');
    try {
      // Create certs directory if it doesn't exist
      const certDir = path.join(process.cwd(), 'build', 'certs');
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
        log.info({
          message: 'Created certificates directory',
          certDir
        });
      }

      // Look for certificate in build/certs directory
      const certPath = path.join(certDir, "rds-ca.pem");
      log.info({
        message: "Attempting to read RDS certificate",
        certPath,
        exists: fs.existsSync(certPath),
      });
      
      if (!fs.existsSync(certPath)) {
        log.warn({
          message: 'RDS certificate not found, falling back to basic SSL',
          certPath
        });
        return {
          rejectUnauthorized: config.dbrejectunauthorized
        };
      }

      const cert = fs.readFileSync(certPath);
      log.info('Successfully loaded RDS certificate');
      return {
        rejectUnauthorized: config.dbrejectunauthorized,
        ca: cert
      };
    } catch (error: any) {
      log.warn({
        message: 'Failed to read RDS certificate, falling back to basic SSL',
        error: error.message
      });
      return {
        rejectUnauthorized: config.dbrejectunauthorized
      };
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
  message: 'Database connection configuration',
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

      pool.on('connection', (connection) => {
        log.info('New connection established', { threadId: connection.threadId });
      });

      pool.on('enqueue', () => {
        log.warn('Waiting for available connection slot');
      });

      pool.on('release', (connection) => {
        log.debug('Connection released', { threadId: connection.threadId });
      });

      // Test the connection
      const conn = await pool.getConnection();
      log.info('Initial connection test successful');
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
        log.debug({
          message: 'Executing query',
          attempt,
          template: getFileName(template),
          params
        });

        const [rows] = await dbConn.query(sqlStr, params);
        const results = extractDbResult(rows, debug);
        const endQueryTime = Date.now();
        const duration = `${endQueryTime - startQueryTime}ms`;
        
        log.info({
          message: 'Query successful',
          template: getFileName(template),
          duration,
          attempt
        });
        
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

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * attempt, 3000); // Progressive delay: 1s, 2s, 3s
        log.info(`Retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
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
