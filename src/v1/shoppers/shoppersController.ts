// SHOPPERS
// TODO: use TSOA annotations instead of express routing
import {
  Body,
  Controller,
  Get,
  Header,
  Path,
  Post,
  Put,
  Route,
  SuccessResponse,
  Tags
} from "tsoa";

import path from "path";
import { logger } from "../../shared/logger";
import { errEnum } from "../../shared/errorHandler";
import { Shopper, ShopperCreationParams } from "./shopper";
import { ShoppersService } from "./shoppersService";
import { mayProceed } from "../../shared/mayProceed";

const accessTemplate = path.join(__dirname, './sql/mayAccessShopper.sql');
const log = logger("Shopper");

// TODO: Utilize swagger validation for email address instead?
const validate = (person: ShopperCreationParams) => {
  // good-enough email address validation
  const emailRegEx =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  const { email } = person;
  if (email && !emailRegEx.test(String(email).toLowerCase())) {
    const err = new Error('Email address is disallowed');
    err.name = errEnum.DISALLOWED_EMAIL;
    throw err;
  }
};

@Route("shoppers")
@Tags("Shoppers")
export class ShoppersController extends Controller {
  /**
   * @summary Creates a new shopper
   * @returns The created shopper
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Body() person: ShopperCreationParams ): Promise<Shopper> {
    validate(person);
    return ShoppersService.create(person);
  }

  /**
   * @summary Retrieves a shopper by ID
   * @param shopperId - The ID of the shopper to retrieve
   * @returns The retrieved shopper
   */
  @Get("{shopperId}")
  @SuccessResponse(200, "OK")
  public async retrieve(@Path() shopperId: string): Promise<Shopper> {
    // TODO: grab X-Auth-User for logging or validation?
    // TODO: add mayProceed check?
    return ShoppersService.retrieve(shopperId);
  }

  /**
   * @summary Updates an existing shopper
   * @returns The updated shopper ID
   */
  @Put("{shopperId}")
  @SuccessResponse(202, "Accepted")
  public async update(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Body() shopper: Shopper): Promise<string> {
    await mayProceed({ email, id: shopperId, accessTemplate });
    validate(shopper);
    return ShoppersService.update(shopperId, shopper);
  }
};


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