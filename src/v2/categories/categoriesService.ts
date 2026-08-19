import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Logger, logger } from "../../shared/logger";
import { Item } from "../items/item";
import { LocationsService } from "../locations/locationsService";

const log: Logger = logger('Category Service')

export abstract class CategoriesService {
  public static async addItem(itemId: string, categoryId: string): Promise<void> {
    const addTemplate = path.join(__dirname, './sql/addItem.sql');
    await dbPost(addTemplate, { itemId, categoryId });
    return;
  };

  public static async removeItem(itemId: string, categoryId: string): Promise<void> {
    const removeItemTemplate = path.join(__dirname, './sql/removeItem.sql');
    await dbPost(removeItemTemplate, { itemId, categoryId });
    return;
  };

  public static async updateCategory(categoryId: string, categoryName: string, categoryOrdinal: number, locationId: string): Promise<void> {
    await LocationsService.assertLocationExists(locationId);
    const updateNameTemplate = path.join(__dirname, './sql/updateCategoryName.sql');
    const upsertOrderTemplate = path.join(__dirname, './sql/upsertCategoryOrdinal.sql');
    await dbPost(updateNameTemplate, { categoryId, categoryName });
    await dbPost(upsertOrderTemplate, { categoryId, categoryOrdinal, locationId });
    return;
  };

  public static async getCategoryItems(categoryId: string): Promise<Array<Item>> {
    const getItemsTemplate = path.join(__dirname, './sql/getCategoryItems.sql');
    const results = await dbPost(getItemsTemplate, { categoryId });
    return results;
  };
};