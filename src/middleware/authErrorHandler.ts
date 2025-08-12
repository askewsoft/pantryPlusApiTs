import { Request, Response, NextFunction } from "express";
import { logger, Logger } from "../shared/logger";

const log: Logger = logger('authErrorHandler');

/**
 * Error handling middleware for authentication and other errors
 */
export function authErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
  // Handle authentication errors
  if (error.status && (error.status === 401 || error.status === 403)) {
    log.warn({
      message: 'Authentication error',
      status: error.status,
      errorMessage: error.message,
      url: req.url,
      method: req.method
    });

    res.status(error.status).json({
      error: error.message || 'Authentication failed'
    });
    return;
  }

  // Pass other errors to the next middleware
  next(error);
}
