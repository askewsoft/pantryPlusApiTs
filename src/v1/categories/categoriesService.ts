import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
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
    const removeTemplate = path.join(__dirname, './sql/removeItem.sql');
    await dbPost(removeTemplate, { itemId, categoryId });
    return;
  };

  public static async updateCategory(categoryId: string, categoryName: string, categoryOrdinal: number): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateCategory.sql');
    await dbPost(updateTemplate, { categoryId, categoryName, categoryOrdinal });
    return;
  };

  public static async getCategoryItems(categoryId: string): Promise<Array<Item>> {
    const getItemsTemplate = path.join(__dirname, './sql/getCategoryItems.sql');
    const [rows, fields] = await dbPost(getItemsTemplate, { categoryId });
    const results = extractDbResult(rows);
    return results;
  };
};