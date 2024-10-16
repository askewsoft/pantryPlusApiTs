import { logger, Logger } from './logger';

const log: Logger = logger('config');

// TODO: use AWS secrets to set env vars for DB connection
type Config = {
  port: number | undefined;
  dbport: number | undefined;
  dbhost: string | undefined;
  dbuser: string | undefined;
  dbpassword: string | undefined;
  database: string | undefined;
  dbssl: string | undefined;
  dbrejectunauthorized: boolean | undefined;
};

const { PORT, DBPORT, DBHOST, DBUSER, DBPASSWORD, DATABASE, DBSSL, DBREJECTUNAUTHORIZED } = process.env;

const config: Config = {
  port: Number(PORT),
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
