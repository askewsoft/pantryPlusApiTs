// CATEGORIES
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, Security, SuccessResponse, Tags, Response} from "tsoa";
import path from "path";

import { CategoriesService } from "./categoriesService";
import { mayProceed } from "../../shared/mayProceed";
import { Item } from "../items/item";
import { Category } from "./category";
import { validateUUIDParam, validateMultipleUUIDs } from "../../shared/uuidValidation";
import { validateObject, ValidationResult } from "../../shared/inputValidation";

const mayModifyCategoryTemplate = path.join(__dirname, "./sql/mayModifyCategory.sql");

/**
 * Validates category input data
 */
function validateCategoryInput(data: any): ValidationResult {
  return validateObject(data, {
    name: { maxLength: 255 },
    ordinal: { customValidator: (value) => typeof value === 'number' && value >= 0 }
  });
}

@Route("categories")
@Tags("Categories")
export class CategoriesController extends Controller {
  /**
   * @summary Associates an item with a category
   * @param email the email address of the user
   * @param categoryId the ID of the category
   * @param itemId the ID of the item
   * @example email "test@test.com"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Post("{categoryId}/items/{itemId}")
  @SuccessResponse(201, "Created")
  @Response(400, "Bad Request", { error: "Invalid UUID format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async addItemToCategory(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Path() itemId: string): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ categoryId, itemId });

    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.addItem(itemId, categoryId);
    return;
  };

  /**
   * @summary Removes an item from a category
   * @param email the email address of the user
   * @param categoryId the ID of the category
   * @param itemId the ID of the item
   * @example email "test@test.com"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Delete("{categoryId}/items/{itemId}")
  @SuccessResponse(204, "No Content")
  @Response(400, "Bad Request", { error: "Invalid UUID format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async removeItemFromCategory(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Path() itemId: string): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ categoryId, itemId });

    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.removeItem(itemId, categoryId);
    return;
  };

  /**
   * @summary Updates a category
   * @param email the email of the user
   * @param locationId the ID of the user's nearest store location
   * @param categoryId the ID of the category
   * @param category an object containing the new name and ordinal of the category
   * @example email "test@test.com"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   * @example category {"name": "Groceries", "ordinal": 1}
   */
  @Put("{categoryId}")
  @SuccessResponse(205, "Content Updated")
  @Response(400, "Bad Request", { error: "Validation failed or invalid input format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async updateCategory(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() categoryId: string, @Body() category: Pick<Category, "name" | "ordinal">): Promise<void> {
    // Validate input data first
    const validation = validateCategoryInput(category);
    if (!validation.isValid) {
      this.setStatus(400);
      throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
    }

    // Validate UUID path parameter
    validateUUIDParam('categoryId', categoryId);

    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.updateCategory(categoryId, category.name, category.ordinal, locationId);
    return;
  };

  /**
   * @summary Gets the items in a category
   * @param email the email address of the user
   * @param categoryId the ID of the category
   * @example email "test@test.com"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Get("{categoryId}/items")
  @SuccessResponse(200, "OK")
  @Response(400, "Bad Request", { error: "Invalid UUID format" })
  @Response(401, "Unauthorized", { error: "Invalid token format" })
  @Security("bearerAuth")
  public async getCategoryItems(@Header("X-Auth-User") email: string, @Path() categoryId: string): Promise<Array<Item>> {
    // Validate UUID path parameter
    validateUUIDParam('categoryId', categoryId);

    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    return await CategoriesService.getCategoryItems(categoryId);
  };
};