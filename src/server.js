"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const routes_1 = require("../build/routes");
const config_1 = __importDefault(require("./shared/config"));
const errorHandler_1 = require("./shared/errorHandler");
const logger_1 = require("./shared/logger");
// import cluster from 'cluster';
const log = (0, logger_1.logger)('server');
const app = (0, express_1.default)();
// Use body parser to read sent json payloads
app.use((0, express_1.urlencoded)({
    extended: true,
}));
app.use((0, express_1.json)());
app.use(errorHandler_1.errorHandler);
(0, routes_1.RegisterRoutes)(app);
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
