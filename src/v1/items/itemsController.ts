// ITEMS
import { Body, Controller, Header, Path, Post, Put, Route, Security, Tags} from "tsoa";
import { mayProceed } from "../../shared/mayProceed";
import { ItemsService } from "./itemsService";
import path from "path";
import { ShoppersService } from "../shoppers/shoppersService";
import { Item } from "./item";

const mayModifyItemTemplate = path.join(__dirname, './sql/mayModifyItem.sql');

@Route("items")
@Tags("Items")
export class ItemsController extends Controller {
  /**
   * @summary Updates an item
   * @param itemId the ID of the item
   * @param item an object containing the new name and UPC of the item
   * @example item {"name": "Milk", "upc": "049000000000"}
   */
  @Put("{itemId}")
  @Security("bearerAuth")
  public async updateItem(@Header("X-Auth-User") email: string, @Path() itemId: string, @Body() item: Pick<Item, "name" | "upc">): Promise<void> {
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    await ItemsService.updateItem({ id: itemId, name: item.name, upc: item.upc }); 
    return;
  };

  /**
   * @summary Creates an item
   * @param item an object containing the ID, name, and UPC of the item
   * @example item {"id": "123E4567-E89B-12D3-A456-426614174000", "name": "Milk", "upc": "049000000000"}
   */
  @Post()
  @Security("bearerAuth")
  public async createItem(@Header("X-Auth-User") email: string, @Body() item: Item): Promise<void> {
    // any valid user can create an item
    await ShoppersService.validateUser(email);
    await ItemsService.create(item); 
    return;
  };
};