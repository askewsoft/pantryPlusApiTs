// ITEMS
import { Body, Controller, Example, Header, Path, Post, Put, Route, Security, Tags, SuccessResponse, Response} from "tsoa";
import { mayProceed } from "../../shared/mayProceed";
import { ItemsService } from "./itemsService";
import path from "path";
import { ShoppersService } from "../shoppers/shoppersService";
import { Item } from "./item";
import { itemsExample } from "./itemsExamples";
import { validateUUIDParam, validateBodyUUIDs } from "../../shared/uuidValidation";
import { validateObject, commonValidations, ValidationResult } from "../../shared/inputValidation";

const mayModifyItemTemplate = path.join(__dirname, './sql/mayModifyItem.sql');

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
   * @summary Updates an item's display name. Case-only changes (e.g. "Aaa batteries" → "AAA batteries") update the existing item in place. Semantic renames are not applied here.
   * @param itemId the ID of the item
   * @param item an object containing the new name and UPC of the item
   * @example item {"name": "Milk", "upc": "049000000000"}
   */
  @Put("{itemId}")
  @SuccessResponse(204, "Content Updated")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async updateItem(@Header("X-Auth-User") email: string, @Path() itemId: string, @Body() item: Pick<Item, "name" | "upc">): Promise<void> {
    // Validate input data first
    const validation = validateObject(item, {
      name: { maxLength: 255 },
      upc: { maxLength: 50, allowEmpty: true }
    });
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate UUID path parameter
    validateUUIDParam('itemId', itemId);

    await mayProceed({ email, id: itemId, accessTemplate: mayModifyItemTemplate });
    await ItemsService.updateItem({ id: itemId, name: item.name, upc: item.upc });
    return;
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
};
