import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { displayItemName, normalizeItemName } from "../../shared/itemName";
import { Item } from "./item";
import { Logger, logger } from "../../shared/logger";
import { ErrorCode } from "../../shared/errorHandler";

const log: Logger = logger('Item Service')

function isDuplicateKeyError(err: any): boolean {
  const original = err?.originalError ?? err;
  return original?.errno === 1062 || original?.code === 'ER_DUP_ENTRY';
}

export abstract class ItemsService {
  public static async findByNormalizedName(nameNormalized: string): Promise<Item | undefined> {
    const findTemplate = path.join(__dirname, './sql/findItemByNormalizedName.sql');
    const results = await dbPost(findTemplate, { nameNormalized });
    return results?.[0];
  }

  public static async getById(itemId: string): Promise<Item | undefined> {
    const getTemplate = path.join(__dirname, './sql/getItemById.sql');
    const results = await dbPost(getTemplate, { itemId });
    return results?.[0];
  }

  /**
   * Find an existing ITEM by normalized name, or create one.
   * On concurrent insert race, re-select the winner by normalized name.
   */
  public static async findOrCreate(item: Item): Promise<Item> {
    const name = displayItemName(item.name);
    const nameNormalized = normalizeItemName(item.name);

    if (!name) {
      throw new Error('Item name is required');
    }

    const existing = await ItemsService.findByNormalizedName(nameNormalized);
    if (existing) {
      log.debug({ message: 'findOrCreate hit', id: existing.id, nameNormalized });
      return existing;
    }

    try {
      const createTemplate = path.join(__dirname, './sql/createItem.sql');
      await dbPost(createTemplate, {
        id: item.id,
        name,
        nameNormalized,
        upc: item.upc ?? null,
      });
      return { id: item.id, name, upc: item.upc };
    } catch (err: any) {
      if (isDuplicateKeyError(err)) {
        const winner = await ItemsService.findByNormalizedName(nameNormalized);
        if (winner) {
          log.debug({ message: 'findOrCreate race resolved', id: winner.id, nameNormalized });
          return winner;
        }
      }
      throw err;
    }
  }

  /** @deprecated Prefer findOrCreate — kept name for call-site clarity during transition */
  public static async create(item: Item): Promise<Item> {
    return ItemsService.findOrCreate(item);
  }

  public static async updateItem(item: Item): Promise<void> {
    const name = displayItemName(item.name);
    const nameNormalized = normalizeItemName(item.name);
    if (!name) {
      const err = new Error('Item name is required') as any;
      err.name = ErrorCode.INVALID_OBJECT;
      throw err;
    }

    const current = await ItemsService.getById(item.id);
    if (!current) {
      const err = new Error('Item not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }

    // #101: case-only display updates in place. Semantic rename is #163.
    if (normalizeItemName(current.name) !== nameNormalized) {
      const err = new Error('Only case-only name changes are allowed') as any;
      err.name = ErrorCode.INVALID_OBJECT;
      throw err;
    }

    const updateTemplate = path.join(__dirname, './sql/updateItem.sql');
    await dbPost(updateTemplate, { itemId: item.id, name, nameNormalized });
    return;
  };
};
