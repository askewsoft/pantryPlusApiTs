import { logger, Logger } from './logger';
import { ErrorCode } from './errorHandler';
import mysql, { PoolOptions } from 'mysql2/promise';
import { readFile } from 'fs/promises';
import { snakeToCamel } from './camelCaseKeys';
import config from './config';

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
  log.info(`Executing query ${template}`);
  try {
    const sqlStr = await extractQuery(template);
    const dbConn = await pool.getConnection()
    const results = await dbConn.query(sqlStr, params);
    dbConn.release();
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
const extractDbResult = (rows: Array<any>): Array<any> => {
  if (Array.isArray(rows[rows.length - 1])) {
    const results = rows.pop();
    return snakeToCamel(results);
  } else {
    const errObj = new Error('invalid database response') as any;
    errObj.name = ErrorCode.DATABASE_ERR;
    throw errObj;
  }
};

export { dbPost, extractDbResult };
