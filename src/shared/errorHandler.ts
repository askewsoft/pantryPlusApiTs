import { logger } from './logger';
import { Request, Response, NextFunction } from 'express';
import { ValidateError } from 'tsoa';

const log = logger('Custom Error');

export enum ErrorCode {
  DISALLOWED_EMAIL = 'DISALLOWED_EMAIL',
  DUPE_ENTRY = 'DUPE_ENTRY',
  INVALID_OBJECT = 'INVALID_OBJECT',
  MISSING_IDENTITY = 'MISSING_IDENTITY',
  NO_ACCESS = 'NO_ACCESS',
  NOT_FOUND = 'NOT_FOUND',
  UNEXPECTED_ERR = 'UNEXPECTED_ERR',
  DATABASE_ERR = 'DATABASE_ERR'
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): Response | void => {
  log.info("\n*** In Error Handler ***\n");
  if (err instanceof ValidateError) {
    log.warn(`Validation error for ${req.method} ${req.url}: ${err.fields}`);
    res.status(422).json( { message: err.message, details: err?.fields });
    return next();
  }
  if ("code" in err) {
    switch (err.code) {
      case ErrorCode.MISSING_IDENTITY:
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
    case ErrorCode.DUPE_ENTRY:
      log.error(`${ErrorCode.DUPE_ENTRY}: ${err.message}\n${err.stack}`);
      res.status(409).send(err.message);
      break;
    case ErrorCode.DATABASE_ERR:
      log.error(`${ErrorCode.DATABASE_ERR}: ${err.message}\n${err.stack}`);
      res.status(500).send(err.message);
      break;
    default:
      log.error(`${ErrorCode.UNEXPECTED_ERR}: ${JSON.stringify(err)}`);
        res.status(500).send(err.message);
    }
  } else {
    log.error(`${ErrorCode.UNEXPECTED_ERR}: ${JSON.stringify(err)}`);
    res.status(500).send(ErrorCode.UNEXPECTED_ERR);
  }
  return next();
};