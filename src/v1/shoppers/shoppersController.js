"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShoppersController = void 0;
// SHOPPERS
// TODO: use TSOA annotations instead of express routing
const tsoa_1 = require("tsoa");
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../shared/logger");
const errorHandler_1 = require("../../shared/errorHandler");
const shoppersService_1 = require("./shoppersService");
// import { mayProceed } from "../../shared/mayProceed";
const accessTemplate = path_1.default.join(__dirname, 'mayAccessShopper.sql');
const log = (0, logger_1.logger)("Shopper");
// TODO: Utilize swagger validation for email address instead?
const validate = (person) => {
    // good-enough email address validation
    const emailRegEx = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    const { email } = person;
    if (email && !emailRegEx.test(String(email).toLowerCase())) {
        const err = new Error('Email address is disallowed');
        err.name = errorHandler_1.errEnum.DISALLOWED_EMAIL;
        throw err;
    }
};
let ShoppersController = class ShoppersController extends tsoa_1.Controller {
    create(person) {
        return __awaiter(this, void 0, void 0, function* () {
            validate(person);
            return shoppersService_1.ShoppersService.create(person);
        });
    }
    retrieve(shopperId) {
        return __awaiter(this, void 0, void 0, function* () {
            return shoppersService_1.ShoppersService.retrieve(shopperId);
        });
    }
};
exports.ShoppersController = ShoppersController;
__decorate([
    (0, tsoa_1.SuccessResponse)(201, "Created"),
    (0, tsoa_1.Post)(),
    __param(0, (0, tsoa_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ShoppersController.prototype, "create", null);
__decorate([
    (0, tsoa_1.SuccessResponse)(200, "OK"),
    (0, tsoa_1.Get)("{shopperId}"),
    __param(0, (0, tsoa_1.Path)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ShoppersController.prototype, "retrieve", null);
exports.ShoppersController = ShoppersController = __decorate([
    (0, tsoa_1.Route)("shoppers"),
    (0, tsoa_1.Tags)("Shoppers")
], ShoppersController);
;
/**
 * @openapi
 * /shoppers/{shopperId}:
 *    get:
 *      summary: Returns the user associated with the supplied ID
 *      tags:
 *        - shoppers
 *      parameters:
 *        - name: X-Auth-User
 *          in: header
 *          required: true
 *          description: the email for the user
 *          schema:
 *            type: string
 *        - name: shopperId
 *          in: path
 *          required: true
 *          description: the Id of the shopper to retrieve
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: OK
 *        '404':
 *          description: Not Found
 */
/**
 * @openapi
 * /shoppers/{shopperId}:
 *    patch:
 *      summary: Updates the email or name of a person
 *      tags:
 *        - shoppers
 *      parameters:
 *        - name: X-Auth-User
 *          in: header
 *          required: true
 *          description: the email for the user
 *          schema:
 *            type: string
 *        - name: shopperId
 *          in: path
 *          required: true
 *          description: the internal ID of the user to be updated
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        description: updated shopper info
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                firstName:
 *                  type: string
 *                lastName:
 *                  type: string
 *                email:
 *                  type: string
 *      responses:
 *        '202':
 *          description: Accepted
 *        '404':
 *          description: Not Found
 *        '422':
 *          description: Unprocessable Entity
const update = async (req, res, next) => {
  const email = req.get('X-Auth-User');
  const { shopperId } = req.params;
  const person = { shopperId, ...req.body };

  await mayProceed({ email, id: shopperId, accessTemplate });

  validate(person);

  const template = path.join(__dirname, 'updateShopper.sql');
  const [rows, fields] = await dbPost(template, person);
  const results = extractDbResult(rows);
  const id = results[0].id;
  return res.status(202).send(id);
};
 */
/**
 * @openapi
 * /shoppers/{shopperId}/groups:
 *    get:
 *      summary: Returns the groups associated with the supplied user
 *      tags:
 *        - shoppers
 *      parameters:
 *        - name: X-Auth-User
 *          in: header
 *          required: true
 *          description: the email for the user
 *          schema:
 *            type: string
 *        - name: shopperId
 *          in: path
 *          required: true
 *          description: the ID of the user's groups to be returned
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: OK
 *        '404':
 *          description: Not Found
const getGroups = async (req, res, next) => {
  const email = req.get('X-Auth-User');
  const { shopperId } = req.params;

  await mayProceed({ email, id: shopperId, accessTemplate });

  const template = path.join(__dirname, 'getGroups.sql');
  const [rows, fields] = await dbPost(template, { email, shopperId });
  const results = extractDbResult(rows)?.[0];
  return res.status(200).send(results);
};
 */
/**
 * @openapi
 * /shoppers/{shopperId}/items:
 *    get:
 *      summary: Returns the items associated with the supplied user
 *      tags:
 *        - shoppers
 *      parameters:
 *        - name: X-Auth-User
 *          in: header
 *          required: true
 *          description: the email for the user
 *          schema:
 *            type: string
 *        - name: shopperId
 *          in: path
 *          required: true
 *          description: the ID of the user
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: OK
 *        '404':
 *          description: Not Found
const getItems = async (req, res, next) => {
  const email = req.get('X-Auth-User');
  const { shopperId } = req.params;

  await mayProceed({ email, id: shopperId, accessTemplate });

  const template = path.join(__dirname, 'getItems.sql');
  const [rows, fields] = await dbPost(template, { email, shopperId });
  const results = extractDbResult(rows)?.[0];
  return res.status(200).send(results);
};
 */
/**
 * @openapi
 * /shoppers/{shopperId}/lists:
 *    get:
 *      summary: Returns the lists associated with the supplied user
 *      tags:
 *        - shoppers
 *      parameters:
 *        - name: X-Auth-User
 *          in: header
 *          required: true
 *          description: the email for the user
 *          schema:
 *            type: string
 *        - name: shopperId
 *          in: path
 *          required: true
 *          description: the ID of the user
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: OK
 *        '404':
 *          description: Not Found
const getLists = async (req, res, next) => {
  const email = req.get('X-Auth-User');
  const { shopperId } = req.params;

  await mayProceed({ email, id: shopperId, accessTemplate });

  const template = path.join(__dirname, 'getLists.sql');
  const [rows, fields] = await dbPost(template, { email, shopperId });
  const results = extractDbResult(rows)?.[0];
  return res.status(200).send(results);
};
 */
/**
 * @openapi
 * /shoppers/{shopperId}/locations:
 *    get:
 *      summary: Returns the locations associated with the supplied user
 *      tags:
 *        - shoppers
 *      parameters:
 *        - name: X-Auth-User
 *          in: header
 *          required: true
 *          description: the email for the user
 *          schema:
 *            type: string
 *        - name: shopperId
 *          in: path
 *          required: true
 *          description: the ID of the user
 *          schema:
 *            type: string
 *      responses:
 *        '200':
 *          description: OK
 *        '404':
 *          description: Not Found
const getLocations = async (req, res, next) => {
  const email = req.get('X-Auth-User');
  const { shopperId } = req.params;

  await mayProceed({ email, id: shopperId, accessTemplate });

  const template = path.join(__dirname, 'getLocations.sql');
  const [rows, fields] = await dbPost(template, { email, shopperId });
  const results = extractDbResult(rows)?.[0];
  return res.status(200).send(results);
};
 */ 
