// ITEMS
import { Body, Controller, Delete, Header, Path, Put, Route, SuccessResponse, Tags} from "tsoa";
import { mayProceed } from "../../shared/mayProceed";
import { ItemsService } from "./itemsService";
import path from "path";

const mayModifyItemTemplate = path.join(__dirname, './sql/mayModifyItem.sql');

@Route("items")
@Tags("Items")
export class ItemsController extends Controller {
  /**
   * @summary Updates an item
   * @param itemId the ID of the item
   * @param body the body of the request
   * @example name "Milk"
   */
  @Put("{itemId}")
  public async updateItem(@Header("X-Auth-User") email: string, @Path() itemId: string, @Body() body: { name: string }): Promise<void> {
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    await ItemsService.updateItem(itemId, body.name); 
    return;
  };
};