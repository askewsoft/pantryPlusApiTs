import express, {json, urlencoded, Request, Response} from "express";
import cors from 'cors';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';

import { RegisterRoutes as RegisterV1Routes } from "./routes.v1";
import config from './shared/config';
import { errorHandler } from './shared/errorHandler';
import { logger, Logger } from './shared/logger';
import { loggableHeaders, debugOnlyPaths, apiPaths } from './shared/loggingWhitelists';

// import cluster from 'cluster';

const log: Logger = logger('server');
const app = express();
app.set('strict routing', true);

// Enable CORS
app.use(cors());

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);

app.use(json());

// Combined request and response logging middleware
app.use((req: Request, res: Response, next: Function) => {
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
});

// Register routes for v1 API
log.info("Registering v1 routes...");
RegisterV1Routes(app);
log.info("v1 routes registered successfully");

// Serve OpenAPI documentation for v1
app.use(["/v1/docs", "/v1/docs/", "/v1/docs/swagger-ui.html"], swaggerUi.serve, async (_req: Request, res: Response) => {
  const options: SwaggerUiOptions = config?.node_env !== 'development' ? {
    swaggerOptions: {
      supportedSubmitMethods: [], // This disables all HTTP methods for all endpoints' form submissions
      tryItOutEnabled: false // This disables the "Try it out" feature for all endpoints
    }
  } : {};
  // Must use `require` here because `import` tries to immediately load the file
  // at build time and the file is not generated yet.
  return res.send(
    swaggerUi.generateHTML(require("../build/swagger.json"), options)
  );
});

app.get("/v1/swagger.json", (req, res) => {
  res.send(require("../build/swagger.json"));
});

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use(function notFoundHandler(_req: Request, res: Response) {
  res.status(404).send({
    message: "Not Found",
  });
});

app.use(errorHandler);

const server = app.listen(config.apiport as number, '0.0.0.0', () => {
  log.info(`PantryPlus API listening on port: ${config.apiport}`);
});

// Enhanced signal handling
process.on('SIGTERM', () => {
  log.warn({
    message: 'SIGTERM received',
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    resourceUsage: process.resourceUsage()
  });
  
  server.close((err) => {
    if (err) {
      log.error({
        message: 'Error while closing server on SIGTERM',
        error: err.message,
        stack: err.stack
      });
    }
    log.warn('Process terminated by SIGTERM');
  });
});

process.on('SIGINT', () => {
  log.warn({
    message: 'SIGINT received',
    pid: process.pid,
    uptime: process.uptime()
  });
  
  server.close((err) => {
    if (err) {
      log.error({
        message: 'Error while closing server on SIGINT',
        error: err.message,
        stack: err.stack
      });
    }
    log.warn('Process terminated by SIGINT');
  });
});

process.on('uncaughtException', (err) => {
  log.error({
    message: 'Uncaught Exception',
    error: err.message,
    stack: err.stack,
    pid: process.pid,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    resourceUsage: process.resourceUsage()
  });
  
  server.close((closeErr) => {
    if (closeErr) {
      log.error({
        message: 'Error while closing server after uncaught exception',
        error: closeErr.message,
        stack: closeErr.stack
      });
    }
    log.warn('Process terminated due to uncaught exception');
    process.exit(1);
  });
});

process.on('unhandledRejection', (reason, promise) => {
  log.error({
    message: 'Unhandled Promise Rejection',
    reason: reason instanceof Error ? reason.stack : reason,
    promise: promise,
    pid: process.pid,
    uptime: process.uptime()
  });
});
