// SHOPPERS
import {
  Body,
  Controller,
  Delete,
  Example,
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

import path from "path";
import { Shopper } from "./shopper";
import { shopperExample, shopperIdExample } from "./shoppersExamples";
import { Group } from "../groups/group";
import { groupsExample } from "../groups/groupsExamples";
import { Item } from "../items/item";
import { itemsExample } from "../items/itemsExamples";
import { List } from "../lists/list";
import { listsExample } from "../lists/listsExamples";
import { Location, RecentLocation } from "../locations/location";
import { recentLocationsExample } from "../locations/locationsExamples";
import { ShoppersService } from "./shoppersService";
import { mayProceed } from "../../shared/mayProceed";

const mayAccessShopperTemplate = path.join(__dirname, './sql/mayAccessShopper.sql');
const maySeeShopperDetailsTemplate = path.join(__dirname, './sql/maySeeShopperDetails.sql');

@Route("shoppers")
@Tags("Shoppers")
export class ShoppersController extends Controller {
  /**
   * @summary Creates a new shopper
   * @param person the shopper to be created
   * @example person {
   *   "id": "123e4567-e89b-12d3-a456-426614174000",
   *   "nickname": "Johnny",
   *   "email": "john.doe@example.com"
   * }
   * @returns The created shopper
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Example<Shopper>(shopperExample)
  public async createShopper(@Body() person: Shopper ): Promise<Shopper> {
    /* TODO:
     * how do we confirm that a user has created a username/password?
     * look into using the @Security decorator to ensure that the user is authenticated
     * https://tsoa-community.github.io/docs/authentication.html
    */
    return ShoppersService.create(person);
  }

  /**
   * @summary Updates an existing shopper
   * @param email the email address of the user
   * @param shopperId the ID of the shopper to be updated
   * @param shopper the updated shopper properties
   * @example shopper {
   *   "nickname": "Johnny",
   *   "email": "john.doe@example.com"
   * }
   * @returns The updated shopper ID
   */
  @Put("{shopperId}")
  @SuccessResponse(205, "Content Updated")
  @Example<Pick<Shopper, "id">>(shopperIdExample)
  public async updateShopper(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Body() shopper: Shopper): Promise<Pick<Shopper, "id">> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.update(shopperId, shopper);
  }

  /**
   * @summary Retrieves a shopper by ID
   * @param email the email address of the user
   * @param shopperId The ID of the shopper to retrieve
   * @returns The retrieved shopper
   */
  @Get("{shopperId}")
  @SuccessResponse(200, "OK")
  @Example<Shopper>(shopperExample)
  public async retrieveShopper(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Shopper> {
    await mayProceed({ email, id: shopperId, accessTemplate: maySeeShopperDetailsTemplate });
    return ShoppersService.retrieve(shopperId);
  }

  /**
   * @summary Retrieves all of the groups associated with a Shopper 
   * @param email the email address of the user
   * @param shopperId the ID of the shopper for whom groups will be returned
   * @returns The groups associated with the supplied shopper
   */
  @Get("{shopperId}/groups")
  @SuccessResponse(200, "OK")
  @Example<Array<Pick<Group, "id" | "name" | "owner">>>(groupsExample)
  public async getGroups(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Pick<Group, "id" | "name" | "owner">>> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.getGroups(shopperId);
  }

  /**
   * @summary Retrieves all groups that a Shopper has been invited to 
   * @param email the email address of the user
   * @param shopperId the ID of the shopper for whom invites will be returned
   * @returns The invites for the supplied shopper
   */
  @Get("{shopperId}/invites")
  @SuccessResponse(200, "OK")
  @Example<Array<Group>>(groupsExample)
  public async getInvites(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Group>> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.getInvites(shopperId);
  }

 /**
  * @summary Declines an invite to a group
  * @param email the email address of the user
  * @param shopperId the ID of the shopper for whom the invite will be declined
  * @param inviteId the ID of the invite to be declined
  */ 
  @Delete("{shopperId}/invites/{inviteId}")
  @SuccessResponse(204, "No Content")
  public async declineInvite(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Path() inviteId: string): Promise<void> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.declineInvite(shopperId, inviteId);
  }

  /**
   * @summary Accepts an invite to a group
   * @param email the email address of the user
   * @param shopperId the ID of the shopper for whom the invite will be accepted
   * @param inviteId the ID of the invite to be accepted
   */
  @Put("{shopperId}/invites/{inviteId}")
  @SuccessResponse(205, "Content Updated")
  public async acceptInvite(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Path() inviteId: string): Promise<void> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.acceptInvite(shopperId, inviteId);
  }

  /**
   * @summary Retrieves all previously purchased items associated with a Shopper 
   * @param email the email address of the user
   * @param shopperId the ID of the shopper for whom items will be returned
   * @returns The items previously purchased by a shopper
   */
  @Get("{shopperId}/items")
  @SuccessResponse(200, "OK")
  @Example<Array<Item>>(itemsExample)
  public async getItems(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Item>> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.getItems(shopperId);
  }

  /**
   * @summary Retrieves all lists associated with a Shopper 
   * @param email the email address of the user
   * @param shopperId the ID of the shopper for whom lists will be returned
   * @returns The lists associated with the supplied shopper
   */
  @Get("{shopperId}/lists")
  @SuccessResponse(200, "OK")
  @Example<Array<List>>(listsExample)
  public async getLists(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<List>> {
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.getLists(shopperId);
  }

  /**
   * @summary Retrieves all locations associated with a Shopper 
   * @param email the email address of the user
   * @param shopperId the ID of the shopper for whom locations will be returned
   * @param lookBackDays the number of days to look back for purchases
   * @returns The locations at which items were purchased by a shopper
   */
  @Get("{shopperId}/locations")
  @SuccessResponse(200, "OK")
  @Example<Array<RecentLocation>>(recentLocationsExample)
  public async getLocations(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Query() lookBackDays: number): Promise<Array<RecentLocation>> {
    return ShoppersService.getLocations(shopperId, lookBackDays);
  }
};