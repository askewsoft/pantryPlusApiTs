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
  if (err instanceof ValidateError) {
    log.warn(`Validation error for ${req.method} ${req.url}: ${JSON.stringify(err.fields)}`);
    res.status(422).json( { message: err.message, details: err?.fields });
    return next();
  }
  if ("name" in err) {
    switch (err.name) {
      case ErrorCode.MISSING_IDENTITY:
      res.status(401).send(err.message);
      break;
    case ErrorCode.NO_ACCESS:
      res.status(403).send(err.message);
      break;
    case ErrorCode.NOT_FOUND:
      res.status(404).send(err.message);
      break;
    case ErrorCode.DUPE_ENTRY:
      res.status(409).send(err.message);
      break;
    case ErrorCode.DATABASE_ERR:
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
