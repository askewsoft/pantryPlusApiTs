import express, {json, urlencoded} from "express";
import { RegisterRoutes } from "./routes";
import config from './shared/config';
import { errorHandler } from './shared/errorHandler';
import { logger, Logger } from './shared/logger';
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
