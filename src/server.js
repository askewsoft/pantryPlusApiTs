"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const logger_1 = require("./shared/logger");
const log = (0, logger_1.logger)('server');
const config_1 = __importDefault(require("./shared/config"));
const errorHandler_1 = require("./shared/errorHandler");
const app = (0, express_1.default)();
app.use(express_1.default.json());
// app.use('/api/v1', require('./v1/router'));
app.use(errorHandler_1.errorHandler);
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.text());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK');
});
// TODO: set up clustering
const server = app.listen(config_1.default.port, () => {
    log.info(`PantryPlus API listening at http://localhost:${config_1.default.port}`);
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
