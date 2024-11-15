// CATEGORIES
import { Controller, Delete, Header, Path, Route, SuccessResponse, Tags} from "tsoa";
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
};