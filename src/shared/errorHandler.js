"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.errEnum = void 0;
const logger_1 = require("./logger");
const log = (0, logger_1.logger)('Custom Error');
exports.errEnum = {
    DISALLOWED_EMAIL: 'DISALLOWED_EMAIL',
    ER_DUP_ENTRY: 'ER_DUP_ENTRY',
    INVALID_OBJECT: 'INVALID_OBJECT',
    MISSING_IDENTITY: 'MISSING_IDENTITY',
    NO_ACCESS: 'NO_ACCESS',
    NOT_FOUND: 'NOT_FOUND',
    UNEXPECTED_ERR: 'UNEXPECTED_ERR'
};
const errorHandler = (err, req, res, next) => {
    switch (err.code) {
        case exports.errEnum.MISSING_IDENTITY:
            log.warn(`${exports.errEnum.MISSING_IDENTITY}: ${err.message}\n${err.stack}`);
            res.status(401).send(err.message);
            break;
        case exports.errEnum.NO_ACCESS:
            log.warn(`${exports.errEnum.NO_ACCESS}: ${err.message}\n${err.stack}`);
            res.status(403).send(err.message);
            break;
        case exports.errEnum.NOT_FOUND:
            log.warn(`${exports.errEnum.NOT_FOUND}: ${err.message}\n${err.stack}`);
            res.status(404).send(err.message);
            break;
        case exports.errEnum.ER_DUP_ENTRY:
            log.error(`${exports.errEnum.ER_DUP_ENTRY}: ${err.message}\n${err.stack}`);
            res.status(409).send(err.message);
            break;
        case exports.errEnum.INVALID_OBJECT:
            log.warn(`${exports.errEnum.INVALID_OBJECT}: ${err.message}\n${err.stack}`);
            res.status(422).send(err.message);
            break;
        default:
            log.error(`${exports.errEnum.UNEXPECTED_ERR}: ${JSON.stringify(err)}`);
            res.status(500).send(err.message);
    }
};
exports.errorHandler = errorHandler;
