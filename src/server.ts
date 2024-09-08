import express, {json, urlencoded, Request, Response} from "express";
import { RegisterRoutes } from "./routes";
import config from './shared/config';
import { errorHandler } from './shared/errorHandler';
import { logger, Logger } from './shared/logger';
import swaggerUi from 'swagger-ui-express';

// import cluster from 'cluster';

const log: Logger = logger('server');
const app = express();

// Use body parser to read sent json payloads
app.use(
  urlencoded({
    extended: true,
  })
);
app.use(json());
app.use(errorHandler);

// Reload and serve the latest swagger.json
app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(
    // Must use `require` here because `import` tries to immediately load the file
    // at build time and the file is not generated yet.
    swaggerUi.generateHTML(require("../build/swagger.json"))
  );
});


RegisterRoutes(app);

app.get('/healthcheck', (req, res) => {
  res.status(200).send('OK');
});

// TODO: set up clustering
const server = app.listen(config.port, () => {
  log.info(`PantryPlus API listening at http://localhost:${config.port}`);
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
