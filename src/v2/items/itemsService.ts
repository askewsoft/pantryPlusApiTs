import path from "path";
import { randomUUID } from "crypto";
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

function requiredName(raw: string): { name: string; nameNormalized: string } {
  const name = displayItemName(raw);
  if (!name) {
    const err = new Error('Item name is required') as any;
    err.name = ErrorCode.INVALID_OBJECT;
    throw err;
  }
  return { name, nameNormalized: normalizeItemName(raw) };
}

export abstract class ItemsService {
  public static async findByNormalizedName(nameNormalized: string): Promise<Item | undefined> {
    const findTemplate = path.join(__dirname, './sql/findItemByNormalizedName.sql');
    const results = await dbPost(findTemplate, { nameNormalized });
    return results?.[0];
  }

  public static async findByAliasNormalized(nameNormalized: string): Promise<Item | undefined> {
    const findTemplate = path.join(__dirname, './sql/findItemByAliasNormalized.sql');
    const results = await dbPost(findTemplate, { aliasNormalized: nameNormalized });
    return results?.[0];
  }

  /** Match ITEM.NAME_NORMALIZED first, then ITEM_ALIAS (reviewed aliases only). */
  public static async resolveByNormalizedName(nameNormalized: string): Promise<Item | undefined> {
    const direct = await ItemsService.findByNormalizedName(nameNormalized);
    if (direct) return direct;
    return ItemsService.findByAliasNormalized(nameNormalized);
  }

  public static async listAliases(itemId: string): Promise<Array<{ name: string }>> {
    const template = path.join(__dirname, './sql/listItemAliases.sql');
    const results = await dbPost(template, { itemId });
    return results ?? [];
  }

  public static async addAlias(itemId: string, rawAliasName: string): Promise<{ name: string }> {
    const aliasName = displayItemName(rawAliasName);
    const aliasNormalized = normalizeItemName(rawAliasName);
    if (!aliasName) {
      const err = new Error('Alias name is required') as any;
      err.name = ErrorCode.INVALID_OBJECT;
      throw err;
    }

    const item = await ItemsService.getById(itemId);
    if (!item) {
      const err = new Error('Item not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
    if (normalizeItemName(item.name) === aliasNormalized) {
      const err = new Error('Alias cannot match the item canonical name') as any;
      err.name = ErrorCode.INVALID_OBJECT;
      throw err;
    }

    const nameTaken = await ItemsService.findByNormalizedName(aliasNormalized);
    if (nameTaken && nameTaken.id !== itemId) {
      const err = new Error('Alias matches another item name') as any;
      err.name = ErrorCode.INVALID_OBJECT;
      throw err;
    }

    try {
      const template = path.join(__dirname, './sql/createItemAlias.sql');
      await dbPost(template, { itemId, aliasName, aliasNormalized });
      return { name: aliasName };
    } catch (err: any) {
      if (isDuplicateKeyError(err)) {
        const existing = await ItemsService.findByAliasNormalized(aliasNormalized);
        if (existing?.id === itemId) {
          return { name: aliasName };
        }
        const conflict = new Error('Alias is already registered') as any;
        conflict.name = ErrorCode.INVALID_OBJECT;
        throw conflict;
      }
      throw err;
    }
  }

  public static async removeAlias(itemId: string, rawAliasName: string): Promise<void> {
    const aliasNormalized = normalizeItemName(rawAliasName);
    if (!aliasNormalized) {
      const err = new Error('Alias name is required') as any;
      err.name = ErrorCode.INVALID_OBJECT;
      throw err;
    }
    const template = path.join(__dirname, './sql/deleteItemAlias.sql');
    await dbPost(template, { itemId, aliasNormalized });
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
    const { name, nameNormalized } = requiredName(item.name);

    const existing = await ItemsService.resolveByNormalizedName(nameNormalized);
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
        const winner = await ItemsService.resolveByNormalizedName(nameNormalized);
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

  public static async isOnList(itemId: string, listId: string): Promise<boolean> {
    const template = path.join(__dirname, './sql/itemIsOnList.sql');
    const results = await dbPost(template, { itemId, listId });
    return Boolean(results?.[0]?.onList);
  }

  public static async hasPurchaseHistory(itemId: string): Promise<boolean> {
    const template = path.join(__dirname, './sql/itemHasPurchaseHistory.sql');
    const results = await dbPost(template, { itemId });
    return Number(results?.[0]?.hasHistory) > 0;
  }

  public static async usedOutsideCohort(itemId: string, listId: string): Promise<boolean> {
    const template = path.join(__dirname, './sql/itemUsedOutsideCohort.sql');
    const results = await dbPost(template, { itemId, listId });
    return Boolean(results?.[0]?.usedElsewhere);
  }

  public static async repointOnList(listId: string, fromItemId: string, toItemId: string): Promise<void> {
    if (fromItemId === toItemId) return;
    const template = path.join(__dirname, './sql/repointItemOnList.sql');
    await dbPost(template, { listId, fromItemId, toItemId });
  }

  /**
   * Rename an item on a list. Returns the ITEM the client should use (id may change).
   * - case-only: update display name in place
   * - name exists: attach this list to that ITEM
   * - novel name, no history and not used outside this cohort: update in place
   * - otherwise: fork a new ITEM and re-point this list only
   */
  public static async renameOnList(itemId: string, listId: string, rawName: string, upc?: string): Promise<Item> {
    const { name, nameNormalized } = requiredName(rawName);

    const current = await ItemsService.getById(itemId);
    if (!current) {
      const err = new Error('Item not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }

    if (normalizeItemName(current.name) === nameNormalized) {
      if (current.name !== name) {
        const updateTemplate = path.join(__dirname, './sql/updateItem.sql');
        await dbPost(updateTemplate, { itemId, name, nameNormalized });
        log.debug({ message: 'rename case-only', itemId, name });
      }
      return { id: itemId, name, upc: current.upc };
    }

    const existing = await ItemsService.resolveByNormalizedName(nameNormalized);
    if (existing && existing.id !== itemId) {
      await ItemsService.repointOnList(listId, itemId, existing.id);
      log.debug({ message: 'rename find-existing', from: itemId, to: existing.id });
      return existing;
    }

    const mustFork =
      (await ItemsService.hasPurchaseHistory(itemId)) ||
      (await ItemsService.usedOutsideCohort(itemId, listId));

    if (!mustFork) {
      const updateTemplate = path.join(__dirname, './sql/updateItem.sql');
      await dbPost(updateTemplate, { itemId, name, nameNormalized });
      log.debug({ message: 'rename in-place', itemId, name });
      return { id: itemId, name, upc: upc ?? current.upc };
    }

    const forked = await ItemsService.findOrCreate({
      id: randomUUID(),
      name,
      upc: upc ?? current.upc,
    });
    await ItemsService.repointOnList(listId, itemId, forked.id);
    log.debug({ message: 'rename fork', from: itemId, to: forked.id, name });
    return forked;
  }
};
