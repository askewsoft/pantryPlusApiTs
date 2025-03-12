import { logger, Logger } from './logger';

const log: Logger = logger('config');

type Config = {
  apiport: number | undefined;
  dbport: number | undefined;
  dbhost: string | undefined;
  dbuser: string | undefined;
  dbpassword: string | undefined;
  database: string | undefined;
  dbssl: string | undefined;
  dbrejectunauthorized: boolean | undefined;
  node_env: string | undefined;
};

const { APIPORT, DBPORT, DBHOST, DBUSER, DBPASSWORD, DATABASE, DBSSL, DBREJECTUNAUTHORIZED, NODE_ENV } = process.env;

const config: Config = {
  apiport: Number(APIPORT),
  dbport: Number(DBPORT),
  dbhost: DBHOST,
  dbuser: DBUSER,
  dbpassword: DBPASSWORD,
  database: DATABASE,
  dbssl: DBSSL,
  dbrejectunauthorized: DBREJECTUNAUTHORIZED === "true",
  node_env: NODE_ENV
};

const verifyConfig = (conf: Config) => {
  for (const key in conf) {
    log.debug(`Checking ${key.toUpperCase()} in process.env`);
    if (!(key.toUpperCase() in process.env) && key.toUpperCase() !== 'NODE_ENV') {
      log.error(`Missing Env Var ${key.toUpperCase()}`);
      process.kill(process.pid, 'SIGTERM');
    }
  }
};

if (config?.node_env === 'development') {
  log.warn('Running in development mode');
} else {
  log.info('Running in production mode');
}

verifyConfig(config);

export default config;
