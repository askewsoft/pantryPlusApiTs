import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { List, ListCreationParams } from "./list";
import { Category, CategoryCreationParams } from "../categories/category";
import { Item } from "../items/item";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('List Service')

export abstract class ListsService {
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

  public static async addItem(listId: string, item: Item): Promise<Pick<Item, "id">> {
    const addItemTemplate = path.join(__dirname, '.sql/addItem.sql');
    const [rows, fields] = await dbPost(addItemTemplate, { id: listId, item });
    const results = extractDbResult(rows);
    const itemId = results[0].id;
    return { id: itemId };
  };

  public static async removeItem(listId: string, itemId: string): Promise<void> {
    const removeItemTemplate = path.join(__dirname, '.sql/removeItem.sql');
    await dbPost(removeItemTemplate, { id: listId, itemId });
    return;
  };

  public static async purchaseItem(listId: string, itemId: string): Promise<void> {
    const purchaseItemTemplate = path.join(__dirname, '.sql/purchaseItem.sql');
    await dbPost(purchaseItemTemplate, { id: listId, itemId });
    return;
  };
};