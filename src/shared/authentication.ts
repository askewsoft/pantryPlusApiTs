import { Request } from 'express';
import { logger } from './logger';
import config from './config';

const log = logger('authentication');

enum AuthErr {
  TYPE = "Authentication Error",
  INVALID_SECURITY = "Unknown security definition",
  NO_TOKEN = "No token provided"
}

export function expressAuthentication(
  request: Request,
  securityName: string,
  _scopes?: string[]
): Promise<any> {
  if (securityName === "bearerAuth") {
    /*
    No token required for local development
    If it doesn't exist in production, the request should never get here.
    API Gateway/Cognito handles validation upstream and will reject the request if the token is invalid.
    But, just in case, we'll log the error and reject the request.
    */
    const token = request.headers["authorization"]?.split(" ")[1];
    if (!token && config.node_env !== 'development') {
      log.error({type: AuthErr.TYPE, comment: AuthErr.NO_TOKEN});
      return Promise.reject({ status: 401, message: AuthErr.NO_TOKEN });
    }
    return Promise.resolve({});
  }
  log.debug({type: AuthErr.TYPE, comment: AuthErr.INVALID_SECURITY});
  return Promise.reject({ status: 401, message: AuthErr.INVALID_SECURITY });
} 