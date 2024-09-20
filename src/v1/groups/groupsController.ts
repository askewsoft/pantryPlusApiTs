// GROUPS
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";

import { Group, GroupCreationParams, GroupCreationResponse, GroupGetResponse } from "./group";
import { Shopper } from "../shoppers/shopper";
import { GroupsService } from "./groupsService";
import { addAllMembersToGroup } from "./groupHelper";
import { ErrorCode } from "../../shared/errorHandler";

@Route("groups")
@Tags("Groups")
export class GroupsController extends Controller {
  /**
   * @summary Creates a new group of shoppers
   * @param email - the email address of the user
   * @returns The created group and added members
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() group: GroupCreationParams ): Promise<GroupCreationResponse> {
    const { name, members } = group;
    try {
      const groupId = await GroupsService.create(name, email);

      if (!groupId) {
        throw new Error("Unable to create group ID");
      }
      if (!members.length) return { id: groupId, members: [] };

      const membersUpdated = await addAllMembersToGroup(groupId, members);
      return { id: groupId, members: membersUpdated };
    } catch (err: any) {
      err.code = ErrorCode.DATABASE_ERR
      throw err;
    }
  };

  /**
   * @summary Updates an existing group name and/or associated members
   * @param email - the email address of the user
   * @param groupId - the ID of the group to be updated
   * @returns Boolean indicating success of the update
   */
  @Put("{groupId}")
  @SuccessResponse(202, "Accepted")
  public async update(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() group: Group): Promise<GroupCreationResponse> {
    const { name, members } = group;
    try {
      await GroupsService.removeAllShoppersFromGroup(groupId);
      const membersUpdated = await addAllMembersToGroup(groupId, members);
      await GroupsService.update(groupId, name);
      return { id: groupId, members: membersUpdated };
    } catch (err: any) {
      err.code = ErrorCode.DATABASE_ERR
      throw err;
    }
  };

  /**
   * @summary Deletes an existing group
   * @param email - the email address of the user
   * @param groupId - the ID of the group to be deleted
   * @returns Boolean indicating success of the removal
   */
  @Delete("{groupId}")
  @SuccessResponse(202, "Accepted")
  public async delete(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<boolean> {
    return GroupsService.delete(groupId);
  };

  /**
   * @summary Gets an existing group
   * @param email - the email address of the user
   * @param groupId - the ID of the group to be returned
   * @returns The details of the group
   */
  @Get("{groupId}")
  @SuccessResponse(200, "OK")
  public async get(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<GroupGetResponse> {
    return GroupsService.get(groupId);
  };

  /**
   * @summary Gets all shoppers in an existing group
   * @param email - the email address of the user
   * @param groupId - the ID of the group to be returned
   * @returns The shoppers in the group
   */
  @Get("{groupId}/shoppers")
  @SuccessResponse(200, "OK")
  public async getGroupShoppers(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Array<Shopper>> {
    return GroupsService.getGroupShoppers(groupId);
  };
};