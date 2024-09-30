import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { List, ListCreationParams } from "./list";
import { Category, CategoryCreationParams } from "../categories/category";
import { Item, ItemCreationParams } from "../items/item";
import { ItemsService } from "../items/itemsService";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('List Service')

export abstract class ListsService {
  // LIST ACTIONS
  public static async create(list: ListCreationParams): Promise<Pick<List, "id">> {
    const { name, ownerId, groupId } = list;
    const createTemplate = path.join(__dirname, '.sql/createList.sql');
    const [rows, fields] = await dbPost(createTemplate, { name, ownerId, groupId });
    const results = extractDbResult(rows);
    const listId = results[0].id;
    return { id: listId };
  };

  public static async update(listId: string, list: ListCreationParams): Promise<void> {
    const { name, ownerId, groupId } = list;
    const updateTemplate = path.join(__dirname, '.sql/updateList.sql');
    await dbPost(updateTemplate, { id: listId, name, ownerId, groupId });
    return;
  };

  public static async delete(listId: string): Promise<void> {
    const deleteTemplate = path.join(__dirname, '.sql/deleteList.sql');
    await dbPost(deleteTemplate, { id: listId });
    return;
  };

  // CATEGORY ACTIONS
  public static async addCategory(listId: string, category: CategoryCreationParams): Promise<Pick<Category, "id">> {
    const addCategoryTemplate = path.join(__dirname, '.sql/addCategory.sql');
    const [rows, fields] = await dbPost(addCategoryTemplate, { id: listId, category });
    const results = extractDbResult(rows);
    const categoryId = results[0].id;
    return { id: categoryId };
  };

  public static async getCategories(listId: string): Promise<Array<Category>> {
    const getCategoriesTemplate = path.join(__dirname, '.sql/getCategories.sql');
    const [rows, fields] = await dbPost(getCategoriesTemplate, { id: listId });
    const results = extractDbResult(rows);
    return results;
  };

  public static async removeCategory(listId: string, categoryId: string): Promise<void> {
    const removeCategoryTemplate = path.join(__dirname, '.sql/removeCategory.sql');
    await dbPost(removeCategoryTemplate, { id: listId, categoryId });
    return;
  };

  // ITEM ACTIONS
  public static async addItem(listId: string, item: string | ItemCreationParams): Promise<Pick<Item, "id">> {
    let itemId: string;
    let categoryId: string | undefined;
    if (typeof item === 'string') {
      itemId = item;
    } else {
      categoryId = item.categoryId;
      const { id } = await ItemsService.create(item);
      itemId = id;
    }
    const addItemTemplate = path.join(__dirname, '.sql/addItem.sql');
    await dbPost(addItemTemplate, { listId, itemId, categoryId });
    return { id: itemId };
  };

  public static async removeItem(listId: string, itemId: string): Promise<void> {
    const removeItemTemplate = path.join(__dirname, '.sql/removeItem.sql');
    await dbPost(removeItemTemplate, { id: listId, itemId });
    return;
  };

  public static async purchaseItem(listId: string, itemId: string, locationId: string): Promise<void> {
    const purchaseItemTemplate = path.join(__dirname, '.sql/purchaseItem.sql');
    await dbPost(purchaseItemTemplate, { listId, itemId, locationId });
    await this.removeItem(listId, itemId);
    return;
  };

  public static async unpurchaseItem(listId: string, itemId: string, locationId: string, purchaseDate: string): Promise<void> {
    const unpurchaseItemTemplate = path.join(__dirname, '.sql/unpurchaseItem.sql');
    const [rows, fields] = await dbPost(unpurchaseItemTemplate, { listId, itemId, locationId, purchaseDate });
    const results = extractDbResult(rows);
    const categoryId = results[0].categoryId;
    await this.addItem(listId, itemId);
    return;
  };
};