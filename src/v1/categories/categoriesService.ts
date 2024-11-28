import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Category Service')

export abstract class CategoriesService {
  public static async removeItem(itemId: string, categoryId: string): Promise<void> {
    const removeTemplate = path.join(__dirname, './sql/removeItem.sql');
    await dbPost(removeTemplate, { itemId, categoryId });
    return;
  };
};