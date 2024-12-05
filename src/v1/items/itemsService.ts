import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { Item } from "../items/item";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Item Service')

export abstract class ItemsService {
  public static async create(item: Item): Promise<Pick<Item, "id">> {
    const createTemplate = path.join(__dirname, './sql/createItem.sql');
    const [rows, fields] = await dbPost(createTemplate, item);
    const results = extractDbResult(rows);
    const itemId = results[0].id;
    return { id: itemId };
  };

  public static async updateItem(itemId: string, itemName: string): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateItem.sql');
    await dbPost(updateTemplate, { itemId, itemName });
    return;
  };
};