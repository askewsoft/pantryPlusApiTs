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
  Security,
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
import { RecentLocation } from "../locations/location";
import { recentLocationsExample } from "../locations/locationsExamples";
import { ShoppersService } from "./shoppersService";
import { mayProceed } from "../../shared/mayProceed";
import { validateUUIDParam, validateMultipleUUIDs, validateBodyUUIDs } from "../../shared/uuidValidation";

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
  @Security("bearerAuth")
  public async createShopper(@Body() person: Shopper ): Promise<Shopper> {
    validateBodyUUIDs(person, ['id'], 'Invalid shopper ID format');
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
  @Security("bearerAuth")
  public async updateShopper(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Body() shopper: Shopper): Promise<Pick<Shopper, "id">> {
    validateUUIDParam('shopperId', shopperId);
    validateBodyUUIDs(shopper, ['id'], 'Invalid shopper ID format');
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
  @Security("bearerAuth")
  public async retrieveShopper(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Shopper> {
    validateUUIDParam('shopperId', shopperId);
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
  @Security("bearerAuth")
  public async getGroups(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Pick<Group, "id" | "name" | "owner">>> {
    validateUUIDParam('shopperId', shopperId);
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
  @Security("bearerAuth")
  public async getInvites(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Group>> {
    validateUUIDParam('shopperId', shopperId);
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
  @Security("bearerAuth")
  public async declineInvite(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Path() inviteId: string): Promise<void> {
    validateMultipleUUIDs({ shopperId, inviteId });
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
  @Security("bearerAuth")
  public async acceptInvite(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Path() inviteId: string): Promise<void> {
    validateMultipleUUIDs({ shopperId, inviteId });
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
  @Security("bearerAuth")
  public async getPurchasedItems(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Item>> {
    validateUUIDParam('shopperId', shopperId);
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.getPurchasedItems(shopperId);
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
  @Security("bearerAuth")
  public async getLists(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<List>> {
    validateUUIDParam('shopperId', shopperId);
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
  @Security("bearerAuth")
  public async getLocations(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Query() lookBackDays: number): Promise<Array<RecentLocation>> {
    validateUUIDParam('shopperId', shopperId);
    await mayProceed({ email, id: shopperId, accessTemplate: mayAccessShopperTemplate });
    return ShoppersService.getLocations(shopperId, lookBackDays);
  }
};