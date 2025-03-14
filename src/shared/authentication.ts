import { Request } from 'express';
import { logger } from './logger';

const log = logger('authentication');

export function expressAuthentication(
  request: Request,
  securityName: string,
  _scopes?: string[]
): Promise<any> {
  if (securityName === "bearerAuth") {
    /*
    We'll just debug log whether the token exists, for local development
    If it doesn't exist in production, the request will never get here.
    API Gateway/Cognito handles validation upstream and will reject the request if the token is invalid.
    */
    const token = request.headers["authorization"]?.split(" ")[1];
    if (!token) {
      log.debug("No token provided");
      return Promise.reject({ status: 401, message: "No token provided" });
    }
    return Promise.resolve({});
  }
  return Promise.reject({ status: 401, message: "Unknown security definition" });
} 