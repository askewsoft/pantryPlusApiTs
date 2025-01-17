// GROUPS
import { Body, Controller, Delete, Example, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { Group } from "./group";
import { groupExample } from "./groupsExamples";
import { Shopper } from "../shoppers/shopper";
import { shoppersExample } from "../shoppers/shoppersExamples";
import { GroupsService } from "./groupsService";
import { ErrorCode } from "../../shared/errorHandler";
import { mayProceed } from "../../shared/mayProceed";
import { ShoppersService } from "../shoppers/shoppersService";

const mayModifyGroupTemplate = path.join(__dirname, "./sql/mayModifyGroup.sql");
const mayAccessGroupTemplate = path.join(__dirname, "./sql/mayAccessGroup.sql");

@Route("groups")
@Tags("Groups")
export class GroupsController extends Controller {
  /**
   * @summary Creates a new group of shoppers
   * @param email the email address of the user
   * @param group an object containing the name and ID of the group to create
   * @example email "user@example.com"
   * @example group {"name": "Family", "id": "123E4567-E89B-12D3-A456-426614174000"}
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async createGroup(@Header("X-Auth-User") email: string, @Body() group: Pick<Group, "name" | "id">): Promise<void> {
    // any valid user can create a group
    const { name, id } = group;
    await ShoppersService.validateUser(email);
    return await GroupsService.create(name, email, id);
  };

  /**
   * @summary Updates an existing group name
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param group an object containing the new name of the group
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example group {"name": "Family & Friends"}
   */
  @Put("{groupId}")
  @SuccessResponse(205, "Content Updated")
  public async updateGroupName(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() group: Pick<Group, "name">): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.update(groupId, group.name);
  };

  /**
   * @summary Invites a shopper to join a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param shopper an object containing the email address of the shopper to be invited
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example shopper {"email": "shopper@example.com"}
   */
  @Post("{groupId}/invitees")
  @SuccessResponse(201, "Created")
  public async inviteShopper(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() shopper: Pick<Shopper, "email">): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.inviteShopper(groupId, shopper.email);
  };

  /**
   * @summary Gets all invitees for a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Get("{groupId}/invitees")
  @SuccessResponse(200, "OK")
  @Example<Array<Pick<Shopper, "email">>>(shoppersExample)
  public async getInvitees(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Array<Pick<Shopper, "email">>> {
    await mayProceed({ email, id: groupId, accessTemplate: mayAccessGroupTemplate });
    return await GroupsService.getInvitees(groupId);
  };

  /**
   * @summary Uninvites a shopper from a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param shopper an object containing the email address of the shopper to be uninvited
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example shopper {"email": "shopper@example.com"}
   */
  @Delete("{groupId}/invitees")
  @SuccessResponse(204, "No Content")
  public async uninviteShopper(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() shopper: Pick<Shopper, "email">): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.uninviteShopper(groupId, shopper.email);
  };

  /**
   * @summary Adds a shopper to a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param shopper an object containing the ID of the shopper to be added
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example shopper {"id": "234F5678-F9A0-23D4-B567-537725285000"}
   */
  @Post("{groupId}/shoppers")
  @SuccessResponse(201, "Created")
  public async addShopperToGroup(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() shopper: Pick<Shopper, "id">): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.addShopperToGroup(shopper.id, groupId);
  };

  /**
   * @summary Removes a shopper from a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param shopperId the ID of the shopper to be removed
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example shopperId "234F5678-F9A0-23D4-B567-537725285000"
   */
  @Delete("{groupId}/shoppers/{shopperId}")
  @SuccessResponse(204, "No Content")
  public async removeShopperFromGroup(@Header("X-Auth-User") email: string, @Path() groupId: string, @Path() shopperId: string): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.removeShopperFromGroup(groupId, shopperId);
  };

  /**
   * @summary Deletes an existing group
   * @param email the email address of the user
   * @param groupId the ID of the group to be deleted
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @returns Boolean indicating success of the removal
   */
  @Delete("{groupId}")
  @SuccessResponse(204, "No Content")
  public async deleteGroup(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return GroupsService.delete(groupId);
  };

  /**
   * @summary Gets an existing group
   * @param email the email address of the user
   * @param groupId the ID of the group to be returned
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The details of the group
   */
  @Get("{groupId}")
  @SuccessResponse(200, "OK")
  @Example<Pick<Group, "id" | "name" | "owner">>(groupExample)
  public async getGroup(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Pick<Group, "id" | "name" | "owner">> {
    await mayProceed({ email, id: groupId, accessTemplate: mayAccessGroupTemplate });
    return GroupsService.get(groupId);
  };

  /**
   * @summary Gets all shoppers in an existing group
   * @param email the email address of the user
   * @param groupId the ID of the group to be returned
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The shoppers in the group
   */
  @Get("{groupId}/shoppers")
  @SuccessResponse(200, "OK")
  @Example<Array<Shopper>>(shoppersExample)
  public async getGroupShoppers(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Array<Shopper>> {
    await mayProceed({ email, id: groupId, accessTemplate: mayAccessGroupTemplate });
    return GroupsService.getGroupShoppers(groupId);
  };
};