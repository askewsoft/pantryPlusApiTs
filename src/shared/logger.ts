import { createLogger, format, transports, Logger } from 'winston';

const { combine, timestamp, json } = format;
/*
  we use npm logging levels
  https://github.com/winstonjs/winston?tab=readme-ov-file#logging-levels
  - error: 0,
  - warn: 1,
  - info: 2,
  - http: 3,
  - verbose: 4,
  - debug: 5,
  - silly: 6
*/
const level = process.env.LOG_LEVEL ?? 'info';

const logger = (module: string): Logger => {
  return createLogger({
    level,
    format: combine(timestamp(), json()),
    defaultMeta: { module },
    transports: [new transports.Console()]
  });
};

logger("Logger").info(`LOG_LEVEL: ${level.toUpperCase()}`);

export { logger, Logger };
