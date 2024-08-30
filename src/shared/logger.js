"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.logger = void 0;
const winston_1 = require("winston");
Object.defineProperty(exports, "Logger", { enumerable: true, get: function () { return winston_1.Logger; } });
const { combine, timestamp, json } = winston_1.format;
const logger = (module) => {
    return (0, winston_1.createLogger)({
        level: 'info',
        format: combine(timestamp(), json()),
        defaultMeta: { module },
        transports: [new winston_1.transports.Console()]
    });
};
exports.logger = logger;
