// ITEMS
import { Body, Controller, Delete, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import { mayProceed } from "../../shared/mayProceed";
import { ItemsService } from "./itemsService";
import path from "path";
import { ShoppersService } from "../shoppers/shoppersService";

const mayModifyItemTemplate = path.join(__dirname, './sql/mayModifyItem.sql');

@Route("items")
@Tags("Items")
export class ItemsController extends Controller {
  /**
   * @summary Updates an item
   * @param itemId the ID of the item
   * @param body the body of the request
   * @example name "Milk"
   * @example upc "049000000000"
   */
  @Put("{itemId}")
  public async updateItem(@Header("X-Auth-User") email: string, @Path() itemId: string, @Body() body: { name: string, upc: string }): Promise<void> {
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    await ItemsService.updateItem({ id: itemId, name: body.name, upc: body.upc }); 
    return;
  };

  /**
   * @summary Creates an item
   * @param body the body of the request
   * @param itemId the ID of the item
   * @example name "Milk"
   * @example upc "049000000000"
   */
  @Post()
  public async createItem(@Header("X-Auth-User") email: string, @Body() body: { itemId: string, name: string, upc: string }): Promise<void> {
    // any valid user can create an item
    await ShoppersService.validateUser(email);
    await ItemsService.create({ id: body.itemId, name: body.name, upc: body.upc }); 
    return;
  };
};