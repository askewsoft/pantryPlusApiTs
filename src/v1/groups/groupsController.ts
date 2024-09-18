// GROUPS
import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Query,
  Route,
  SuccessResponse,
  Tags
} from "tsoa";

import { Group, GroupCreationParams, GroupCreationResponse } from "./group";
import { GroupsService } from "./groupsService";
import { ErrorCode } from "../../shared/errorHandler";

@Route("groups")
@Tags("Groups")
export class GroupsController extends Controller {
  /**
   * @summary Creates a new group of shoppers
   * @returns The created group and added members
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() group: GroupCreationParams ): Promise<GroupCreationResponse> {
    const { name, members } = group;
    let groupId: string;
    try {
      groupId = await GroupsService.create(name, email);

      if (!groupId) {
        throw new Error("Unable to create group ID");
      }
      if (!members.length) return { id: groupId, members: [] };

      /*
        loop over array of members, each of whom must already exist as a user
        we will NOT allow new members to be created here
        https://github.com/askewsoft/pantryPlus/issues/35
      */
      const addShopper = (shopperId: string) : Promise<boolean> => {
        // groupId is handled through closure
        return GroupsService.addShopperToGroup(shopperId, groupId);
      };

      const mappedPromises = members.map(addShopper);
      const results = await Promise.allSettled(mappedPromises);
      const membersUpdated = members.filter((member, index) => results[index]);
      return { id: groupId, members: membersUpdated };
    } catch (err: any) {
      err.code = ErrorCode.DATABASE_ERR
      throw err;
    }
  };

  @Delete("{groupId}")
  @SuccessResponse(202, "Accepted")
  public async delete(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<boolean> {
    return GroupsService.delete(groupId);
  };

  @Get("{groupId}")
  @SuccessResponse(200, "OK")
  public async get(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Group> {
    return GroupsService.get(groupId);
  };
};

/**
 * @openapi
 * /groups/{groupId}:
 *    get:
 *      summary: Retrieves a group of users
 *      tags:
 *        - groups
 *      parameters:
 *        - name: groupId
 *          in: path
 *          required: true
 *          description: The ID of the group
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        description: shopper
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                email:
 *                  type: string
 *      responses:
 *        '200':
 *          description: OK
 *        '404':
 *          description: Not Found
const retrieve = async (req, res) => {
  const { email } = req.params;
  const result = await db.get('fetchGroup', { email });
  return res.status(200).send('get group', result);
};
 */

/**
 * @openapi
 * /groups/{groupId}:
 *    patch:
 *      summary: Updates a group of users
 *      tags:
 *        - groups
 *      parameters:
 *        - name: groupId
 *          in: path
 *          required: true
 *          description: the Id of the group to be updated
 *          schema:
 *            type: string
 *      requestBody:
 *        required: true
 *        description: update group name
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                name:
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
const update = async (req, res) => {
  const { name, email } = req.body;
  const { groupId } = req.params;
  const person = await groups.update(groupId, req.body);
  res.status(200).send(`patch group ${groupId}`);
};

const validate = (person) => {
  if (typeof person !== 'object') return new Error('Group expected to be an object');
};
 */