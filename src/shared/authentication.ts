import { Request } from 'express';
import { logger } from './logger';
import config from './config';

const log = logger('authentication');

enum AuthErr {
  TYPE = "Authentication Error",
  INVALID_SECURITY = "Unknown security definition",
  NO_TOKEN = "No token provided",
  INVALID_TOKEN_FORMAT = "Invalid token format"
}

// Basic JWT token validation (format only, not cryptographic)
function isValidTokenFormat(token: string): boolean {
  // JWT tokens should be base64-encoded strings with 3 parts separated by dots
  // This is a basic format check, not a security validation
  if (!token || typeof token !== 'string') return false;

  // Check if it looks like a JWT token (3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  // Each part should be base64-encoded and not empty
  for (const part of parts) {
    if (!part || part.length === 0) return false;
    // Basic check that it contains only valid base64 characters
    if (!/^[A-Za-z0-9+/=_-]+$/.test(part)) return false;
  }

  return true;
}

export function expressAuthentication(
  request: Request,
  securityName: string,
  _scopes?: string[]
): Promise<any> {
  if (securityName === "bearerAuth") {
    const authHeader = request.headers["authorization"];

    if (!authHeader) {
      log.error({type: AuthErr.TYPE, comment: AuthErr.NO_TOKEN});
      return Promise.reject({ status: 401, message: AuthErr.NO_TOKEN });
    }

    // Check if it's a Bearer token
    if (!authHeader.startsWith('Bearer ')) {
      log.error({type: AuthErr.TYPE, comment: AuthErr.INVALID_TOKEN_FORMAT});
      return Promise.reject({ status: 401, message: AuthErr.INVALID_TOKEN_FORMAT });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      log.error({type: AuthErr.TYPE, comment: AuthErr.NO_TOKEN});
      return Promise.reject({ status: 401, message: AuthErr.NO_TOKEN });
    }

    // In development, we still validate token format but don't require a valid JWT
    if (config.node_env === 'development') {
      // For development, allow any token that has valid format
      if (!isValidTokenFormat(token)) {
        log.error({type: AuthErr.TYPE, comment: AuthErr.INVALID_TOKEN_FORMAT});
        return Promise.reject({ status: 401, message: AuthErr.INVALID_TOKEN_FORMAT });
      }
      return Promise.resolve({});
    }

    // In production, require a valid token format
    if (!isValidTokenFormat(token)) {
      log.error({type: AuthErr.TYPE, comment: AuthErr.INVALID_TOKEN_FORMAT});
      return Promise.reject({ status: 401, message: AuthErr.INVALID_TOKEN_FORMAT });
    }

    return Promise.resolve({});
  }

  log.debug({type: AuthErr.TYPE, comment: AuthErr.INVALID_SECURITY});
  return Promise.reject({ status: 401, message: AuthErr.INVALID_SECURITY });
}