import { Request, Response, NextFunction } from "express";
import { logger, Logger } from "../shared/logger";

const log: Logger = logger('jsonErrorHandler');

/**
 * Middleware to handle JSON parsing errors and other request parsing failures
 */
export function jsonErrorHandler(error: any, req: Request, res: Response, next: NextFunction): void {
  // Handle JSON parsing errors (SyntaxError from malformed JSON)
  if (error instanceof SyntaxError && 'body' in error) {
    log.warn({
      message: 'JSON parsing error',
      error: error.message,
      url: req.url,
      method: req.method,
      body: req.body
    });

    res.status(400).json({
      error: 'Invalid JSON format',
      details: error.message
    });
    return;
  }

  // Handle other parsing errors
  if (error.status === 400 && 'body' in error) {
    log.warn({
      message: 'Request parsing error',
      error: error.message,
      url: req.url,
      method: req.method,
      body: req.body
    });

    res.status(400).json({
      error: 'Request parsing failed',
      details: error.message
    });
    return;
  }

  // Pass other errors to the next middleware
  next(error);
}
