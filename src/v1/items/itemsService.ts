import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Item } from "../items/item";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Item Service')

export abstract class ItemsService {
  public static async create(item: Item): Promise<Pick<Item, "id">> {
    const createTemplate = path.join(__dirname, './sql/createItem.sql');
    const results = await dbPost(createTemplate, item);
    const itemId = results[0].id;
    return { id: itemId };
  };

  public static async updateItem(item: Item): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateItem.sql');
    await dbPost(updateTemplate, item);
    return;
  };
};