import { logger, Logger } from './logger';

const log: Logger = logger('Custom Error');

export const errEnum = {
  DISALLOWED_EMAIL: 'DISALLOWED_EMAIL',
  ER_DUP_ENTRY: 'ER_DUP_ENTRY',
  INVALID_OBJECT: 'INVALID_OBJECT',
  MISSING_IDENTITY: 'MISSING_IDENTITY',
  NO_ACCESS: 'NO_ACCESS',
  NOT_FOUND: 'NOT_FOUND',
  UNEXPECTED_ERR: 'UNEXPECTED_ERR'
};

export const errorHandler = (err: any, req: any, res: any, next: any) => {
  switch (err.code) {
    case errEnum.MISSING_IDENTITY:
      log.warn(`${errEnum.MISSING_IDENTITY}: ${err.message}\n${err.stack}`);
      res.status(401).send(err.message);
      break;
    case errEnum.NO_ACCESS:
      log.warn(`${errEnum.NO_ACCESS}: ${err.message}\n${err.stack}`);
      res.status(403).send(err.message);
      break;
    case errEnum.NOT_FOUND:
      log.warn(`${errEnum.NOT_FOUND}: ${err.message}\n${err.stack}`);
      res.status(404).send(err.message);
      break;
    case errEnum.ER_DUP_ENTRY:
      log.error(`${errEnum.ER_DUP_ENTRY}: ${err.message}\n${err.stack}`);
      res.status(409).send(err.message);
      break;
    case errEnum.INVALID_OBJECT:
      log.warn(`${errEnum.INVALID_OBJECT}: ${err.message}\n${err.stack}`);
      res.status(422).send(err.message);
      break;
    default:
      log.error(`${errEnum.UNEXPECTED_ERR}: ${JSON.stringify(err)}`);
      res.status(500).send(err.message);
  }
};