import path from "path";
import { dbPost } from "../../shared/dbDriver";
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

  public static async delete(listId: string): Promise<void> {
    const deleteTemplate = path.join(__dirname, './sql/deleteList.sql');
    await dbPost(deleteTemplate, { id: listId });
    return;
  };

  // CATEGORY ACTIONS
  public static async createCategory(listId: string, category: Category): Promise<void> {
    const { id, name, ordinal } = category;
    const createCategoryTemplate = path.join(__dirname, './sql/createCategory.sql');
    await dbPost(createCategoryTemplate, { listId, id, name, ordinal });
    return;
  };

  public static async getCategories(listId: string): Promise<Array<Category>> {
    const getCategoriesTemplate = path.join(__dirname, './sql/getCategories.sql');
    const results = await dbPost(getCategoriesTemplate, { listId });
    return results;
  };

  public static async getItems(listId: string): Promise<Array<Item>> {
    const getItemsTemplate = path.join(__dirname, './sql/getListItems.sql');
    const results = await dbPost(getItemsTemplate, { listId });
    return results;
  };

  public static async removeCategory(listId: string, categoryId: string): Promise<void> {
    const removeCategoryTemplate = path.join(__dirname, './sql/removeCategory.sql');
    await dbPost(removeCategoryTemplate, { id: listId, categoryId });
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