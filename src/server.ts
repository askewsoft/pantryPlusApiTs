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

// Enhanced request logging middleware
app.use((req: Request, _res: Response, next: Function) => {
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

// TODO: set up clustering
const server = app.listen(config.apiport, () => {
  log.info(`PantryPlus API listening at http://localhost:${config.apiport}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    log.warn('Process terminated');
  });
});

process.on('uncaughtException', (err) => {
  server.close(() => {
    log.error('uncaughtException');
    log.error(err);
    log.warn('Process terminated unexpectedly');
  });
});
