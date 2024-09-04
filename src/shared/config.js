import { logger } from './logger.js';
const log = logger('config');
const config = {
    port: Number(process.env.DBPORT),
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DATABASE
};
const verifyConfig = (conf) => {
    for (const key in conf) {
        if (!conf[key]) {
            log.error(`Missing Env Var ${key}`);
            process.kill(process.pid, 'SIGTERM');
        }
    }
};
verifyConfig(config);
export default config;
