// SHOPPERS
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
// import { logger } from "../../shared/logger";
import { Shopper, ShopperCreationParams } from "./shopper";
import { Group } from "../groups/group";
import { Item } from "../items/item";
import { List } from "../lists/list";
import { Location } from "../locations/location";
import { ShoppersService } from "./shoppersService";
import { mayProceed } from "../../shared/mayProceed";

const accessTemplate = path.join(__dirname, './sql/mayAccessShopper.sql');
// const log = logger("Shopper");

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
    return ShoppersService.create(person);
  }

  /**
   * @summary Updates an existing shopper
   * @param email - the email address of the user
   * @param shopperId - the ID of the shopper to be updated
   * @returns The updated shopper ID
   */
  @Put("{shopperId}")
  @SuccessResponse(202, "Accepted")
  public async update(@Header("X-Auth-User") email: string, @Path() shopperId: string, @Body() shopper: Shopper): Promise<string> {
    await mayProceed({ email, id: shopperId, accessTemplate });
    return ShoppersService.update(shopperId, shopper);
  }

  /**
   * @summary Retrieves a shopper by ID
   * @param shopperId - The ID of the shopper to retrieve
   * @returns The retrieved shopper
   */
  @Get("{shopperId}")
  @SuccessResponse(200, "OK")
  public async retrieve(@Path() shopperId: string): Promise<Shopper> {
    return ShoppersService.retrieve(shopperId);
  }

  /**
   * @summary Retrieves all of the groups associated with a Shopper 
   * @param email - the email address of the user
   * @param shopperId - the ID of the shopper for whom groups will be returned
   * @returns The groups associated with the supplied shopper
   */
  @Get("{shopperId}/groups")
  @SuccessResponse(200, "OK")
  public async getGroups(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Group>> {
    await mayProceed({ email, id: shopperId, accessTemplate });
    return ShoppersService.getGroups(shopperId);
  }

  /**
   * @summary Retrieves all previously purchased items associated with a Shopper 
   * @param email - the email address of the user
   * @param shopperId - the ID of the shopper for whom items will be returned
   * @returns The items associated with the supplied shopper
   */
  @Get("{shopperId}/items")
  @SuccessResponse(200, "OK")
  public async getItems(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Item>> {
    await mayProceed({ email, id: shopperId, accessTemplate });
    return ShoppersService.getItems(shopperId);
  }

  /**
   * @summary Retrieves all lists associated with a Shopper 
   * @param email - the email address of the user
   * @param shopperId - the ID of the shopper for whom lists will be returned
   * @returns The lists associated with the supplied shopper
   */
  @Get("{shopperId}/lists")
  @SuccessResponse(200, "OK")
  public async getLists(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<List>> {
    await mayProceed({ email, id: shopperId, accessTemplate });
    return ShoppersService.getLists(shopperId);
  }

  /**
   * @summary Retrieves all locations associated with a Shopper 
   * @param email - the email address of the user
   * @param shopperId - the ID of the shopper for whom locations will be returned
   * @returns The locations associated with the supplied shopper
   */
  @Get("{shopperId}/locations")
  @SuccessResponse(200, "OK")
  public async getLocations(@Header("X-Auth-User") email: string, @Path() shopperId: string): Promise<Array<Location>> {
    await mayProceed({ email, id: shopperId, accessTemplate });
    return ShoppersService.getLocations(shopperId);
  }
};