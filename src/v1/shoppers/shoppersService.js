var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver.js";
export class ShoppersService {
    static retrieve(shopperId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const template = path.join(__dirname, 'getShopper.sql');
            const [rows] = yield dbPost(template, { shopperId });
            const results = (_a = extractDbResult(rows)) === null || _a === void 0 ? void 0 : _a[0];
            if (!results) {
                const err = new Error('user not found');
                err.name = 'NOT_FOUND';
                throw err;
            }
            return results;
        });
    }
    static create(newShopper) {
        return __awaiter(this, void 0, void 0, function* () {
            const template = path.join(__dirname, 'createShopper.sql');
            const [rows, fields] = yield dbPost(template, newShopper);
            const results = extractDbResult(rows);
            return results;
        });
    }
}
