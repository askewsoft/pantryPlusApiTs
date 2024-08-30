import express from 'express';
import cluster from 'cluster';
import asyncHandler from 'express-async-handler';
import bodyParser from 'body-parser';
import { logger, Logger } from './shared/logger';

const log: Logger = logger('server');
import config from './shared/config';
import { errorHandler } from './shared/errorHandler';
const app = express();

app.use(express.json());
// app.use('/api/v1', require('./v1/router'));
app.use(errorHandler);
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(bodyParser.urlencoded({ extended: false }));

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
