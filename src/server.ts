import express, {json, urlencoded, Request, Response} from "express";
import cors from 'cors';
import swaggerUi, { SwaggerUiOptions } from 'swagger-ui-express';

import { RegisterRoutes as RegisterV2Routes } from "./routes.v2";
import { RegisterRoutes as RegisterV3Routes } from "./routes.v3";
import config from './shared/config';
import { errorHandler } from './shared/errorHandler';
import {
  jsonErrorHandler,
  requestLogger,
  authErrorHandler,
  notFoundHandler
} from './middleware';
import { logger, Logger } from './shared/logger';

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

// JSON parsing error handling middleware
app.use(jsonErrorHandler);

// Combined request and response logging middleware
app.use(requestLogger);

RegisterV2Routes(app);
console.log("v2 routes registered successfully");
RegisterV3Routes(app);
console.log("v3 routes registered successfully");

const swaggerUiOptions = (): SwaggerUiOptions =>
  config?.node_env !== 'development' ? {
    swaggerOptions: {
      supportedSubmitMethods: [],
      tryItOutEnabled: false
    }
  } : {};

// Serve OpenAPI documentation for v2
app.use(["/v2/docs", "/v2/docs/", "/v2/docs/swagger-ui.html"], swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(
    swaggerUi.generateHTML(require("../build/swagger.v2.json"), swaggerUiOptions())
  );
});

app.get("/v2/swagger.json", (req, res) => {
  res.send(require("../build/swagger.v2.json"));
});

app.use(["/v3/docs", "/v3/docs/", "/v3/docs/swagger-ui.html"], swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(
    swaggerUi.generateHTML(require("../build/swagger.v3.json"), swaggerUiOptions())
  );
});

app.get("/v3/swagger.json", (req, res) => {
  res.send(require("../build/swagger.v3.json"));
});

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

app.use(notFoundHandler);

// Error handling middleware for authentication and other errors
app.use(authErrorHandler);

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
