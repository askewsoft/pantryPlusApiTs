// CATEGORIES
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { CategoriesService } from "./categoriesService";
import { mayProceed } from "../../shared/mayProceed";
import { Item } from "../items/item";

const mayModifyCategoryTemplate = path.join(__dirname, "./sql/mayModifyCategory.sql");

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
  public async addItemToCategory(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Path() itemId: string): Promise<void> {
    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.addItem(itemId, categoryId);
    return;
  };

  /**
   * @summary Removes an item from a category
   * @param itemId the ID of the item
   * @param categoryId the ID of the category
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Delete("{categoryId}/items/{itemId}")
  @SuccessResponse(205, "Content Updated")
  public async removeItemFromCategory(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Path() itemId: string): Promise<void> {
    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.removeItem(itemId, categoryId);
    return;
  };

  /**
   * @summary Updates a category
   * @param email the email of the user
   * @param categoryId the ID of the category
   * @param body the body of the request
   * @example name "Groceries"
   */
  @Put("{categoryId}")
  @SuccessResponse(205, "Content Updated")
  public async updateCategory(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Body() body: { name: string, ordinal: number }): Promise<void> {
    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.updateCategory(categoryId, body.name, body.ordinal);
    return;
  };

  /**
   * @summary Gets the items in a category
   * @param categoryId the ID of the category
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Get("{categoryId}/items")
  public async getCategoryItems(@Header("X-Auth-User") email: string, @Path() categoryId: string): Promise<Array<Item>> {
    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    return await CategoriesService.getCategoryItems(categoryId);
  };
};