import { logger, Logger } from './logger.js';

const log: Logger = logger('dbDriver');
import mysql from 'mysql2';
import { readFile } from 'fs/promises';
import camelcaseKeys from 'camelcase-keys';
import config from './config.js';

const extractQuery = async (template: string): Promise<string> => {
  const sqlFile = await readFile(template, 'utf8');
  const sqlStr = sqlFile
    .replace(/\/\*[\s\S]*?\*\/|\-\-.*/g, '')
    .replace(/\s{1,}/g, ' ')
    .trim()
    .replace(/\s,/g, ',');
  return sqlStr;
};

const sqlConnectOpts: mysql.PoolOptions = {
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
  multipleStatements: true,
  ssl: 'Amazon RDS',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  charset: 'utf8'
};

const pool = mysql.createPool(sqlConnectOpts);

// dbPost returns a promise
const dbPost = async (template: string, params: any): Promise<any> => {
  log.info(`Executing query ${template}`);
  const sqlStr = await extractQuery(template);
  const dbConn = pool.promise();
  const results = await dbConn.query(sqlStr, params);
  return results;
};

// returns the array of results w/o all the MySQL wrapping
const extractDbResult = (rows: any): any => {
  if (rows && Array.isArray(rows) && Array.isArray(rows[rows.length - 1])) {
    const results = rows.pop();
    return camelcaseKeys(results);
  } else {
    const errObj = new Error('invalid database response');
    errObj.name = 'BAD_DB_RESPONSE';
    throw errObj;
  }
};

export { dbPost, extractDbResult };
