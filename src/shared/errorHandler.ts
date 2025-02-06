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
  DATABASE_ERR = 'DATABASE_ERR',
  TYPE_ERROR = 'TypeError'
};

const getErrorMsg = (err: any) => {
  let message;
  if (typeof err === 'string') message = err;
  else if (err?.message) message = err.message;
  else if (typeof err === 'object') message = JSON.stringify(Object.entries(err));
  return message;
};

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): Response | void => {
  if (err instanceof ValidateError) {
    log.warn(`Validation error for ${req.method} ${req.url}: ${JSON.stringify(err.fields)}`);
    res.status(422).json( { message: err.message, details: err?.fields });
    return next();
  }
  if ("name" in err) {
    let errMessage;
    switch (err.name) {
    case ErrorCode.MISSING_IDENTITY:
      errMessage = err.message;
      res.status(401).send(errMessage);
      break;
    case ErrorCode.NO_ACCESS:
      errMessage = err.message;
      res.status(403).send(errMessage);
      break;
    case ErrorCode.NOT_FOUND:
      errMessage = err.message;
      res.status(404).send(errMessage);
      break;
    case ErrorCode.DUPE_ENTRY:
      errMessage = err.message;
      res.status(409).send(errMessage);
      break;
    case ErrorCode.TYPE_ERROR:
      errMessage = getErrorMsg(err);
      log.error(`${ErrorCode.UNEXPECTED_ERR} (${err.name}) for ${req.method} ${req.url} with fields ${JSON.stringify(err.fields ?? {})}; ${errMessage}`);
      res.status(422).send(`${ErrorCode.TYPE_ERROR}: ${errMessage}`);
      break;
    case ErrorCode.DATABASE_ERR:
      errMessage = err.message;
      res.status(500).send(errMessage);
      break;
    default:
      errMessage = getErrorMsg(err);
      log.error(`${ErrorCode.UNEXPECTED_ERR} (${err.name}) for ${req.method} ${req.url} with fields ${JSON.stringify(err.fields ?? {})}; ${errMessage}`);
      res.status(500).send(errMessage);
    }
  } else {
    const errMessage = getErrorMsg(err);
    log.error(`${ErrorCode.UNEXPECTED_ERR} for ${req.method} ${req.url} with fields ${JSON.stringify(err.fields ?? {})}; ${errMessage}`);
    res.status(500).send(errMessage);
  }
  return next();
};
