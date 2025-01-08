// GROUPS
import { Body, Controller, Delete, Example, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { Group } from "./group";
import { groupExample, groupCreationExample } from "./groupsExamples";
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
   * @param name the group to create 
   * @example email "user@example.com"
   * @example name "Family"
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async createGroup(@Header("X-Auth-User") email: string, @Body() name: string): Promise<void> {
    // any valid user can create a group
    await ShoppersService.validateUser(email);
    return await GroupsService.create(name, email);
  };

  /**
   * @summary Updates an existing group name
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param name the name of the group to update
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example name "Family"
   */
  @Put("{groupId}")
  @SuccessResponse(205, "Content Updated")
  public async updateGroupName(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() name: string): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.update(groupId, name);
  };

  /**
   * @summary Invites a shopper to join a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param email the email address of the shopper to be invited
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example shopperEmail "shopper@example.com"
   */
  @Post("{groupId}/invite")
  @SuccessResponse(201, "Created")
  public async inviteShopper(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() shopperEmail: string): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.inviteShopper(groupId, shopperEmail);
  };

  /**
   * @summary Adds a shopper to a group
   * @param email the email address of the user
   * @param groupId the ID of the group to be updated
   * @param shopperId the ID of the shopper to be added
   * @example email "user@example.com"
   * @example groupId "123E4567-E89B-12D3-A456-426614174000"
   * @example shopperId "234F5678-F9A0-23D4-B567-537725285000"
   */
  @Post("{groupId}/shoppers")
  @SuccessResponse(201, "Created")
  public async addShopperToGroup(@Header("X-Auth-User") email: string, @Path() groupId: string, @Body() shopperId: string): Promise<void> {
    await mayProceed({ email, id: groupId, accessTemplate: mayModifyGroupTemplate });
    return await GroupsService.addShopperToGroup(shopperId, groupId);
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
  @SuccessResponse(205, "Content Updated")
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
  @Example<Pick<Group, "id" | "name" | "ownerId">>(groupExample)
  public async getGroup(@Header("X-Auth-User") email: string, @Path() groupId: string): Promise<Pick<Group, "id" | "name" | "ownerId">> {
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