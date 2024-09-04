"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractDbResult = exports.dbPost = void 0;
const logger_1 = require("./logger");
const log = (0, logger_1.logger)('dbDriver');
const mysql2_1 = __importDefault(require("mysql2"));
const promises_1 = require("fs/promises");
const camelCaseKeys_1 = require("./camelCaseKeys");
const config_1 = __importDefault(require("./config"));
const extractQuery = async (template) => {
    const sqlFile = await (0, promises_1.readFile)(template, 'utf8');
    const sqlStr = sqlFile
        .replace(/\/\*[\s\S]*?\*\/|\-\-.*/g, '')
        .replace(/\s{1,}/g, ' ')
        .trim()
        .replace(/\s,/g, ',');
    return sqlStr;
};
const sqlConnectOpts = {
    host: config_1.default.host,
    user: config_1.default.user,
    password: config_1.default.password,
    database: config_1.default.database,
    multipleStatements: true,
    ssl: 'Amazon RDS',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    namedPlaceholders: true,
    charset: 'utf8'
};
const pool = mysql2_1.default.createPool(sqlConnectOpts);
// dbPost returns a promise
const dbPost = async (template, params) => {
    log.info(`Executing query ${template}`);
    const sqlStr = await extractQuery(template);
    const dbConn = pool.promise();
    const results = await dbConn.query(sqlStr, params);
    return results;
};
exports.dbPost = dbPost;
// returns the array of results w/o all the MySQL wrapping
const extractDbResult = (rows) => {
    if (rows && Array.isArray(rows) && Array.isArray(rows[rows.length - 1])) {
        const results = rows.pop();
        return (0, camelCaseKeys_1.snakeToCamel)(results);
    }
    else {
        const errObj = new Error('invalid database response');
        errObj.name = 'BAD_DB_RESPONSE';
        throw errObj;
    }
};
exports.extractDbResult = extractDbResult;
