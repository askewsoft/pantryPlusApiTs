import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, json } = format;
const level = process.env.LOG_LEVEL || 'info';

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
