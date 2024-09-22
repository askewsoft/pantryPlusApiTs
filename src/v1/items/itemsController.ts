import { Body, Controller, Header, Post, Route, SuccessResponse, Tags } from "tsoa";

import { ItemCreationParams } from "./item";
import { ItemsService } from "./itemsService";

@Route("items")
@Tags("Items")
export class ItemsController extends Controller {
  /**
   * @summary Creates a new item
   * @param email the email address of the user
   * @returns The ID of the created item
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() item: ItemCreationParams): Promise<string> {
    const { name, upc } = item;
    const itemId = await ItemsService.create(name, upc);
    return itemId;
  };
};