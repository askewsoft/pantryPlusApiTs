import { Request, Response, NextFunction } from "express";
import { logger, Logger } from "../shared/logger";
import { loggableHeaders, debugOnlyPaths, apiPaths } from "../shared/loggingWhitelists";
import config from "../shared/config";

const log: Logger = logger('requestLogger');

/**
 * Combined request and response logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const debugLoggingOnly = debugOnlyPaths.some(path => req.url.startsWith(path));
  const apiLoggingOnly = apiPaths.some(path => req.url.startsWith(path));
  const sillyLoggingOnly = !debugLoggingOnly && !apiLoggingOnly;

  const logMsg = {
    type: debugLoggingOnly ? 'diagnostic' : apiLoggingOnly ? 'api' : 'suspicious',
    method: req.method,
    url: req.url,
  };

  if (debugLoggingOnly) {
    log.debug(logMsg);
  } else if (sillyLoggingOnly) {
    log.silly(logMsg);
  } else {
    // Logging for API routes
    log.info(logMsg);

    if (['verbose', 'debug', 'silly'].includes(config.log_level)) {
      const verboseLoggingHeaders = Object.fromEntries(
        Object.entries(req.headers || {})
          .filter(([key]) => loggableHeaders.includes(key))
      );
      const verboseLoggingParams = req.params ?? undefined;
      const verboseLoggingBody = req.body ?? undefined;
      const extendedLogMsg = {
        headers: verboseLoggingHeaders,
        params: verboseLoggingParams,
        body: verboseLoggingBody
      };
      log.verbose({headers: extendedLogMsg.headers, params: extendedLogMsg.params, body: extendedLogMsg.body});
    }
  }

  // Log response details when the response is finished
  res.on('finish', () => {
    log.verbose({
      message: 'Response sent',
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      sourceIp: req.ip || req.socket.remoteAddress,
      headers: req.headers
    });
  });

  next();
}
