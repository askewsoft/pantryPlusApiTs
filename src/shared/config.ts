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
};

const { APIPORT, DBPORT, DBHOST, DBUSER, DBPASSWORD, DATABASE, DBSSL, DBREJECTUNAUTHORIZED } = process.env;

const config: Config = {
  apiport: Number(APIPORT),
  dbport: Number(DBPORT),
  dbhost: DBHOST,
  dbuser: DBUSER,
  dbpassword: DBPASSWORD,
  database: DATABASE,
  dbssl: DBSSL,
  dbrejectunauthorized: DBREJECTUNAUTHORIZED === "true"
};

const verifyConfig = (conf: Config) => {
  for (const key in conf) {
    if (!(key.toUpperCase() in process.env)) {
      log.error(`Missing Env Var ${key}`);
      process.kill(process.pid, 'SIGTERM');
    }
  }
};

verifyConfig(config);

export default config;
