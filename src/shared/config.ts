import { logger, Logger } from './logger.js';

const log: Logger = logger('config');

// TODO: use AWS secrets to set env vars for DB connection
type Config = {
  port: number | undefined;
  host: string | undefined;
  user: string | undefined;
  password: string | undefined;
  database: string | undefined;
};

const config: Config = {
  port: Number(process.env.DBPORT),
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
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
