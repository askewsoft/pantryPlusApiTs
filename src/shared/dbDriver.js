var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logger } from './logger.js';
const log = logger('dbDriver');
import mysql from 'mysql2';
import { readFile } from 'fs/promises';
import camelcaseKeys from 'camelcase-keys';
import config from './config.js';
const extractQuery = (template) => __awaiter(void 0, void 0, void 0, function* () {
    const sqlFile = yield readFile(template, 'utf8');
    const sqlStr = sqlFile
        .replace(/\/\*[\s\S]*?\*\/|\-\-.*/g, '')
        .replace(/\s{1,}/g, ' ')
        .trim()
        .replace(/\s,/g, ',');
    return sqlStr;
});
const sqlConnectOpts = {
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
const dbPost = (template, params) => __awaiter(void 0, void 0, void 0, function* () {
    log.info(`Executing query ${template}`);
    const sqlStr = yield extractQuery(template);
    const dbConn = pool.promise();
    const results = yield dbConn.query(sqlStr, params);
    return results;
});
// returns the array of results w/o all the MySQL wrapping
const extractDbResult = (rows) => {
    if (rows && Array.isArray(rows) && Array.isArray(rows[rows.length - 1])) {
        const results = rows.pop();
        return camelcaseKeys(results);
    }
    else {
        const errObj = new Error('invalid database response');
        errObj.name = 'BAD_DB_RESPONSE';
        throw errObj;
    }
};
export { dbPost, extractDbResult };
