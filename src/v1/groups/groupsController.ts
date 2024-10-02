// GROUPS
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { Group, GroupCreationParams, GroupCreationResponse, GroupGetResponse } from "./group";
import { Shopper } from "../shoppers/shopper";
import { GroupsService } from "./groupsService";
import { addAllMembersToGroup } from "./groupHelper";
import { ErrorCode } from "../../shared/errorHandler";
import { mayProceed } from "../../shared/mayProceed";

const mayModifyGroupTemplate = path.join(__dirname, "./sql/mayModifyGroup.sql");
const mayAccessGroupTemplate = path.join(__dirname, "./sql/mayAccessGroup.sql");

@Route("groups")
@Tags("Groups")
export class GroupsController extends Controller {
  /**
   * @summary Creates a new group of shoppers
   * @param email the email address of the user
   * @returns The created group and added members
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() group: GroupCreationParams ): Promise<GroupCreationResponse> {
    // any authenticated user can create a group
    const { name, members } = group;
    const groupId = await GroupsService.create(name, email);

    if (!groupId) {
      const err = new Error("Unable to create group ID") as any;
      err.code = ErrorCode.DATABASE_ERR;
      throw err;
    }
    if (!members.length) return { id: groupId, members: [] };

    const membersUpdated = await addAllMembersToGroup(groupId, members);
    return { id: groupId, members: membersUpdated };
  };

  /**
   * @summary Updates an existing group name and/or associated members
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @returns Boolean indicating success of the update
   */
  @Put("{groupId}")
  @SuccessResponse(205, "Content Updated")
  public async update(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() group: Group): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    const { name, members } = group;
    await GroupsService.removeAllShoppersFromGroup(groupId);
    await addAllMembersToGroup(groupId, members);
    return await GroupsService.update(groupId, name);
  };

  /**
   * @summary Deletes an existing group
   * @param email the email address of the user
   * @param groupId the ID of the group to be deleted
   * @returns Boolean indicating success of the removal
   */
  @Delete("{groupId}")
  @SuccessResponse(205, "Content Updated")
  public async delete(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return GroupsService.delete(groupId);
  };

  /**
   * @summary Gets an existing group
   * @param email the email address of the user
   * @param groupId the ID of the group to be returned
   * @returns The details of the group
   */
  @Get("{groupId}")
  @SuccessResponse(200, "OK")
  public async get(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<GroupGetResponse> {
    await mayProceed({ email, id: groupId, accessTemplate: mayAccessGroupTemplate });
    return GroupsService.get(groupId);
  };

  /**
   * @summary Gets all shoppers in an existing group
   * @param email the email address of the user
   * @param groupId the ID of the group to be returned
   * @returns The shoppers in the group
   */
  @Get("{groupId}/shoppers")
  @SuccessResponse(200, "OK")
  public async getGroupShoppers(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Array<Shopper>> {
    await mayProceed({ email, id: groupId, accessTemplate: mayAccessGroupTemplate });
    return GroupsService.getGroupShoppers(groupId);
  };
};