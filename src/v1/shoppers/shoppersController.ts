// SHOPPERS
import { Request, Response, NextFunction } from "express";
import { UUID } from "node:crypto";
import path from "path";
import { logger } from "../../shared/logger";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { errEnum } from "../../shared/errorHandler";
import { Shopper } from "./shopper";
import { ShoppersService } from "./shoppersService";
// import { mayProceed } from "../../shared/mayProceed";

const accessTemplate = path.join(__dirname, 'mayAccessShopper.sql');
const log = logger("Shopper");

// TODO: Utilize swagger validation for email address instead?
const validate = (person: Shopper) => {
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

/**
 * @openapi
 * /shoppers:
 *    post:
 *      summary: Creates a user
 *      tags:
 *        - shoppers
 *      requestBody:
 *        required: true
 *        description: create a new shopper, no need to authorize
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - firstName
 *                - lastName
 *                - email
 *              properties:
 *                firstName:
 *                  type: string
 *                lastName:
 *                  type: string
 *                email:
 *                  type: string
 *      responses:
 *        '201':
 *          description: Created
 *        '409':
 *          description: Conflict - entity already exists
 *        '422':
 *          description: Unprocessable Entity
 */
const create = async (req: Request, res: Response): Promise<Response> => {
  const person = req.body;
  validate(person);
  let shopper: Shopper | null = null;
  try {
    shopper = await ShoppersService.create(person);
  } catch (err: any) {
    err.name = 'UNPROCESSABLE_ENTITY';
    return res.status(422).send(err);
  }
  const shopperId = shopper.id;
  return res.status(201).send(shopperId);
};

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
const retrieve = async (req: Request, res: Response): Promise<Response> => {
  const { shopperId } = req.params;
  let shopper: Shopper | null = null;
  try {
    shopper = await ShoppersService.retrieve(shopperId as UUID);
    if (!shopper) {
      const err = new Error('user not found');
      err.name = 'NOT_FOUND';
      return res.status(404).send(err);
    }
  } catch (err: any) {
    err.name = 'UNEXPECTED_ERROR';
    return res.status(500).send(err);
  }
  return res.status(200).send(shopper);
};

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

module.exports = {
  create,
  retrieve,
  // update,
  // getGroups,
  // getItems,
  // getLists,
  // getLocations
};
