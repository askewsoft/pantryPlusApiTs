import path from "path";
import { dbPost, dbTransaction, extractQuery } from "../../shared/dbDriver";
import { LocationsService } from "../locations/locationsService";
import { List } from "./list";
import { Category } from "../categories/category";
import { Item } from "../items/item";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('List Service')

export abstract class ListsService {
  // LIST ACTIONS
  public static async create(userEmail: string, list: List): Promise<void> {
    const { id, name, ordinal } = list;
    const createTemplate = path.join(__dirname, './sql/createList.sql');
    await dbPost(createTemplate, { listId: id, name, userEmail, ordinal });
    return;
  };

  public static async update(userEmail: string, listId: string, listName: string, groupId: string, listOrdinal: number): Promise<void> {
    const updateTemplate = path.join(__dirname, './sql/updateList.sql');
    await dbPost(updateTemplate, { userEmail, listId, listName, groupId, listOrdinal });
    return;
  };

  public static async delete(listId: string, email: string): Promise<void> {
    const deleteTemplate = path.join(__dirname, './sql/deleteList.sql');
    await dbPost(deleteTemplate, { listId, email });
    return;
  };

  // CATEGORY ACTIONS
  public static async createCategory(listId: string, category: Category, locationId: string): Promise<void> {
    const { id, name, ordinal } = category;
    const createCategoryTemplate = path.join(__dirname, './sql/createCategory.sql');
    await dbPost(createCategoryTemplate, { listId, id, name, ordinal, locationId });
    return;
  };

  public static async getCategories(listId: string, locationId: string): Promise<Array<Category>> {
    const getCategoriesTemplate = path.join(__dirname, './sql/getCategories.sql');
    const results = await dbPost(getCategoriesTemplate, { listId, locationId });
    return results;
  };

  /**
   * Sets CATEGORY_ORDER ordinals for all categories in one transaction (avoids partial writes
   * when the client previously sent many PUTs).
   */
  public static async reorderCategoriesForLocation(
    listId: string,
    locationId: string,
    orderedCategoryIds: string[]
  ): Promise<void> {
    await LocationsService.assertLocationExists(locationId);
    const existing = await this.getCategories(listId, locationId);
    const existingIds = new Set(existing.map(c => c.id));
    if (orderedCategoryIds.length !== existingIds.size) {
      throw new Error('Category count does not match list');
    }
    for (const id of orderedCategoryIds) {
      if (!existingIds.has(id)) {
        throw new Error('Category id does not belong to list');
      }
    }
    const upsertTemplate = path.join(__dirname, '../categories/sql/upsertCategoryOrdinal.sql');
    const sqlStr = await extractQuery(upsertTemplate);
    await dbTransaction(async (conn) => {
      for (let i = 0; i < orderedCategoryIds.length; i++) {
        await conn.query(sqlStr, {
          categoryId: orderedCategoryIds[i],
          locationId,
          categoryOrdinal: i
        });
      }
    });
  };

  public static async getListItems(listId: string): Promise<Array<Item>> {
    const getItemsTemplate = path.join(__dirname, './sql/getListItems.sql');
    const results = await dbPost(getItemsTemplate, { listId });
    return results;
  };

  public static async getListItemsCount(listId: string): Promise<{ count: number }> {
    const getItemsCountTemplate = path.join(__dirname, './sql/getListItemsCount.sql');
    const results = await dbPost(getItemsCountTemplate, { listId });
    return results[0];
  };

  public static async removeCategory(listId: string, categoryId: string): Promise<void> {
    const removeCategoryTemplate = path.join(__dirname, './sql/removeCategory.sql');
    await dbPost(removeCategoryTemplate, { listId, categoryId });
    return;
  };

  // ITEM ACTIONS
  public static async addItem(listId: string, itemId: string): Promise<void> {
    const addItemTemplate = path.join(__dirname, './sql/addItem.sql');
    await dbPost(addItemTemplate, { listId, itemId });
    return;
  };

  public static async removeItem(listId: string, itemId: string): Promise<void> {
    const removeItemTemplate = path.join(__dirname, './sql/removeItem.sql');
    await dbPost(removeItemTemplate, { listId, itemId });
    return;
  };

  public static async purchaseItem(userEmail: string, listId: string, itemId: string, locationId: string): Promise<void> {
    const purchaseItemTemplate = path.join(__dirname, './sql/purchaseItem.sql');
    await dbPost(purchaseItemTemplate, { listId, itemId, locationId, userEmail });
    await this.removeItem(listId, itemId);
    return;
  };

  public static async unpurchaseItem(listId: string, itemId: string, locationId: string, purchaseDate: string): Promise<void> {
    const unpurchaseItemTemplate = path.join(__dirname, './sql/unpurchaseItem.sql');
    await dbPost(unpurchaseItemTemplate, { listId, itemId, locationId, purchaseDate });
    await this.addItem(listId, itemId);
    return;
  };
};