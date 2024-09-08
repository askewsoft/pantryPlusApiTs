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
};

const config: Config = {
  port: Number(process.env.PORT),
  dbport: Number(process.env.DBPORT),
  dbhost: process.env.DBHOST,
  dbuser: process.env.DBUSER,
  dbpassword: process.env.DBPASSWORD,
  database: process.env.DATABASE
};

const verifyConfig = (conf: Config) => {
  for (const key in conf) {
    if (!conf[key as keyof Config]) {
      log.error(`Missing Env Var ${key}`);
      process.kill(process.pid, 'SIGTERM');
    }
  }
};

verifyConfig(config);

export default config;
