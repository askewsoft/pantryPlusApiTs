// CATEGORIES
import { Body, Controller, Delete, Header, Path, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { CategoriesService } from "./categoriesService";
import { mayProceed } from "../../shared/mayProceed";

const mayModifyCategoryTemplate = path.join(__dirname, "./sql/mayModifyCategory.sql");

@Route("categories")
@Tags("Categories")
export class CategoriesController extends Controller {
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
  public async updateCategory(@Header("X-Auth-User") email: string, @Path() categoryId: string, @Body() body: { name: string }): Promise<void> {
    await mayProceed({ email, id: categoryId, accessTemplate: mayModifyCategoryTemplate });
    await CategoriesService.updateCategory(categoryId, body.name);
    return;
  };
};
