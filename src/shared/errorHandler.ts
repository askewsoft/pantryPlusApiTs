import { logger } from './logger';

const log = logger('Custom Error');

export enum ErrorCode {
  DISALLOWED_EMAIL = 'DISALLOWED_EMAIL',
  ER_DUP_ENTRY = 'ER_DUP_ENTRY',
  INVALID_OBJECT = 'INVALID_OBJECT',
  MISSING_IDENTITY = 'MISSING_IDENTITY',
  NO_ACCESS = 'NO_ACCESS',
  NOT_FOUND = 'NOT_FOUND',
  UNEXPECTED_ERR = 'UNEXPECTED_ERR',
  DATABASE_ERR = 'DATABASE_ERR'
};

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  switch (err.code) {
    case ErrorCode.MISSING_IDENTITY:
      // TODO: probably do not need this now that it is handled by typescript validation
      log.warn(`${ErrorCode.MISSING_IDENTITY}: ${err.message}\n${err.stack}`);
      res.status(401).send(err.message);
      break;
    case ErrorCode.NO_ACCESS:
      log.warn(`${ErrorCode.NO_ACCESS}: ${err.message}\n${err.stack}`);
      res.status(403).send(err.message);
      break;
    case ErrorCode.NOT_FOUND:
      log.warn(`${ErrorCode.NOT_FOUND}: ${err.message}\n${err.stack}`);
      res.status(404).send(err.message);
      break;
    case ErrorCode.ER_DUP_ENTRY:
      log.error(`${ErrorCode.ER_DUP_ENTRY}: ${err.message}\n${err.stack}`);
      res.status(409).send(err.message);
      break;
    case ErrorCode.INVALID_OBJECT:
      // TODO: probably do not need this now that it is handled by typescript validation
      log.warn(`${ErrorCode.INVALID_OBJECT}: ${err.message}\n${err.stack}`);
      res.status(422).send(err.message);
      break;
    default:
      log.error(`${ErrorCode.UNEXPECTED_ERR}: ${JSON.stringify(err)}`);
      res.status(500).send(err.message);
  }
};