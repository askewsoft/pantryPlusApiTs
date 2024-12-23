import { logger, Logger } from './logger';
import { ErrorCode } from './errorHandler';
import mysql, { PoolOptions, RowDataPacket } from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { snakeToCamel } from './camelCaseKeys';
import config from './config';
import getFileName from './getFileName';
const log: Logger = logger('dbDriver');

const extractQuery = async (template: string): Promise<string> => {
  const sqlFile = await readFile(template, 'utf8');
  const sqlStr = sqlFile
    .replace(/\/\*[\s\S]*?\*\/|\-\-.*/g, '')
    .replace(/\s{1,}/g, ' ')
    .trim()
    .replace(/\s,/g, ',');
  return sqlStr;
};

const sqlConnectOpts: PoolOptions = {
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpassword,
  database: config.database,
  multipleStatements: true,
  ssl: {
    // config.dbssl, -- replace ssl object w/ a string value
    rejectUnauthorized: config.dbrejectunauthorized
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  charset: 'utf8'
};

const pool = mysql.createPool(sqlConnectOpts);

// dbPost returns a promise
const dbPost = async (template: string, params: Object): Promise<any> => {
  const startQueryTime = Date.now();
  try {
    const sqlStr = await extractQuery(template);
    const dbConn = await pool.getConnection()
    const [rows] = await dbConn.query(sqlStr, params);
    dbConn.release();
    const results = extractDbResult(rows);
    const endQueryTime = Date.now();
    log.info(`Query ${getFileName(template)} completed in ${endQueryTime - startQueryTime}ms`);
    return results;
  } catch (err: any) {
    log.error(err);
    // DO NOT expose the error details to the client
    const errObj = new Error('dbDriver POST error') as any;
    errObj.name = ErrorCode.DATABASE_ERR;
    throw errObj;
  }
};

// returns the array of results w/o all the MySQL wrapping
const extractDbResult = (rows: any): Array<any> | undefined => {
  if (Array.isArray(rows) && rows.length > 0) {
    const results = rows.pop();
    if (Array.isArray(results)) {
      const normalizedResults = snakeToCamel(results);
      return normalizedResults;
    } else {
      log.debug(`extractDbResult - there are no results`);
      return;
    }
  } else {
    const errObj = new Error('invalid database response') as any;
    errObj.name = ErrorCode.DATABASE_ERR;
    log.error(errObj);
    throw errObj;
  }
};

export { dbPost };
