import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, json } = format;

const logger = (module: string): Logger => {
  return createLogger({
    level: 'info',
    format: combine(timestamp(), json()),
    defaultMeta: { module },
    transports: [new transports.Console()]
  });
};

export { logger, Logger };
