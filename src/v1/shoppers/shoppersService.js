"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppersService = void 0;
const path_1 = __importDefault(require("path"));
const dbDriver_1 = require("../../shared/dbDriver");
class ShoppersService {
    static async retrieve(shopperId) {
        const template = path_1.default.join(__dirname, 'getShopper.sql');
        const [rows] = await (0, dbDriver_1.dbPost)(template, { shopperId });
        const results = (0, dbDriver_1.extractDbResult)(rows)?.[0];
        if (!results) {
            const err = new Error('user not found');
            err.name = 'NOT_FOUND';
            throw err;
        }
        return results;
    }
    static async create(newShopper) {
        const template = path_1.default.join(__dirname, 'createShopper.sql');
        const [rows, fields] = await (0, dbDriver_1.dbPost)(template, newShopper);
        const results = (0, dbDriver_1.extractDbResult)(rows);
        return results;
    }
}
exports.ShoppersService = ShoppersService;
