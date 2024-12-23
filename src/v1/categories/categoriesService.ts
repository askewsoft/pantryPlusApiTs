import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Logger, logger } from "../../shared/logger";
import { Item } from "../items/item";

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

  public static async updateCategory(categoryId: string, categoryName: string, categoryOrdinal: number): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateCategory.sql');
    await dbPost(updateTemplate, { categoryId, categoryName, categoryOrdinal });
    return;
  };

  public static async getCategoryItems(categoryId: string): Promise<Array<Item>> {
    const getItemsTemplate = path.join(__dirname, './sql/getCategoryItems.sql');
    const results = await dbPost(getItemsTemplate, { categoryId });
    log.debug(`getCategoryItems - ID: ${categoryId} - number of results: ${results.length}`);
    return results;
  };
};