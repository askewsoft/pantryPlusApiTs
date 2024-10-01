// CATEGORIES
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";

import { CategoriesService } from "./categoriesService";

@Route("categories")
@Tags("Categories")
export class CategoriesController extends Controller {
  /**
   * @summary Removes an item from a category
   * @param itemId the ID of the item
   * @param categoryId the ID of the category
   */
  @Delete("{categoryId}/items/{itemId}")
  @SuccessResponse(205, "Content Updated")
  public async removeItem(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Path() itemId: string): Promise<void> {
    await CategoriesService.removeItem(itemId, categoryId);
    return;
  };
};