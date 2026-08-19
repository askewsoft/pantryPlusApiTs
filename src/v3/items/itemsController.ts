// ITEMS
import { Body, Controller, Delete, Example, Get, Header, Path, Post, Put, Route, Security, Tags, SuccessResponse, Response} from "tsoa";
import { mayProceed } from "../../shared/mayProceed";
import { ItemsService } from "./itemsService";
import path from "path";
import { ShoppersService } from "../shoppers/shoppersService";
import { Item, ItemAlias, ItemAliasCreate, ItemUpdate } from "./item";
import { itemsExample } from "./itemsExamples";
import { validateUUIDParam, validateBodyUUIDs } from "../../shared/uuidValidation";
import { validateObject, commonValidations, ValidationResult } from "../../shared/inputValidation";
import { ErrorCode } from "../../shared/errorHandler";

const mayModifyItemTemplate = path.join(__dirname, './sql/mayModifyItem.sql');
const mayContributeToListTemplate = path.join(__dirname, '../lists/sql/mayContributeToList.sql');

/**
 * Validates item input data
 */
function validateItemInput(data: any): ValidationResult {
  return validateObject(data, {
    id: commonValidations.uuid,
    name: { maxLength: 255 },
    upc: { maxLength: 50, allowEmpty: true }
  });
}

@Route("items")
@Tags("Items")
export class ItemsController extends Controller {
  /**
   * @summary Rename an item on a list. Returns the item the client should use (id may change on find-existing or fork). Case-only changes update display name in place.
   * @param itemId the ID of the item currently on the list
   * @param item name, optional UPC, and the list whose membership to re-point
   * @example item {"name": "Milk", "upc": "049000000000", "listId": "123E4567-E89B-12D3-A456-426614174000"}
   */
  @Put("{itemId}")
  @SuccessResponse(200, "OK")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Example<Item>(itemsExample[0])
  @Security("bearerAuth")
  public async updateItem(@Header("X-Auth-User") email: string, @Path() itemId: string, @Body() item: ItemUpdate): Promise<Item> {
    const validation = validateObject(item, {
      name: { maxLength: 100 },
      upc: { maxLength: 50, allowEmpty: true },
      listId: commonValidations.uuid,
    });
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    validateUUIDParam('itemId', itemId);
    validateUUIDParam('listId', item.listId);

    await mayProceed({ email, id: item.listId, accessTemplate: mayContributeToListTemplate });
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    const onList = await ItemsService.isOnList(itemId, item.listId);
    if (!onList) {
      this.setStatus(404);
      const err = new Error('Item is not on this list') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
    const renamed = await ItemsService.renameOnList(itemId, item.listId, item.name, item.upc);
    this.setStatus(200);
    return renamed;
  };

  /**
   * @summary Find or create an item by normalized name. Returns the canonical item (existing or newly created).
   * @param item an object containing a candidate ID, name, and optional UPC. The returned id may differ from the candidate when a match already exists.
   * @example item {"id": "123E4567-E89B-12D3-A456-426614174000", "name": "Milk", "upc": "049000000000"}
   */
  @Post()
  @SuccessResponse(200, "OK")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Example<Item>(itemsExample[0])
  @Security("bearerAuth")
  public async createItem(@Header("X-Auth-User") email: string, @Body() item: Item): Promise<Item> {
    // Validate input data first
    const validation = validateItemInput(item);
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate UUID in request body
    validateBodyUUIDs(item, ['id'], 'Invalid item ID format');

    // any valid user can create an item
    await ShoppersService.validateUser(email);
    const canonical = await ItemsService.findOrCreate(item);
    this.setStatus(200);
    return canonical;
  };

  /**
   * @summary List reviewed alternate names that resolve to this item
   */
  @Get("{itemId}/aliases")
  @SuccessResponse(200, "OK")
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async listItemAliases(
    @Header("X-Auth-User") email: string,
    @Path() itemId: string,
  ): Promise<Array<ItemAlias>> {
    validateUUIDParam('itemId', itemId);
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    return ItemsService.listAliases(itemId);
  }

  /**
   * @summary Register an alternate name for find-or-create and typeahead (not a merge)
   */
  @Post("{itemId}/aliases")
  @SuccessResponse(201, "Created")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async createItemAlias(
    @Header("X-Auth-User") email: string,
    @Path() itemId: string,
    @Body() body: ItemAliasCreate,
  ): Promise<ItemAlias> {
    validateUUIDParam('itemId', itemId);
    const validation = validateObject(body, { name: { maxLength: 100 } });
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    const alias = await ItemsService.addAlias(itemId, body.name);
    this.setStatus(201);
    return alias;
  }

  /**
   * @summary Remove an alias from an item (path segment is normalized form of the alias name)
   */
  @Delete("{itemId}/aliases/{aliasName}")
  @SuccessResponse(204, "No Content")
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async deleteItemAlias(
    @Header("X-Auth-User") email: string,
    @Path() itemId: string,
    @Path() aliasName: string,
  ): Promise<void> {
    validateUUIDParam('itemId', itemId);
    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    await ItemsService.removeAlias(itemId, decodeURIComponent(aliasName));
    this.setStatus(204);
  }
};
