// LISTS
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";

import { List, ListCreationParams } from "./list";
import { Category, CategoryCreationParams } from "../categories/category";
import { Item, ItemCreationParams } from "../items/item";
import { ListsService } from "./listsService";
import { ErrorCode } from "../../shared/errorHandler";

@Route("lists")
@Tags("Lists")
export class ListsController extends Controller {
  /**
   * @summary Creates a new list of items
   * @param email the email address of the user
   * @returns The ID of the created list
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() newList: ListCreationParams ): Promise<Pick<List, "id">> {
    return await ListsService.create(newList);
  };

  /**
   * @summary Adds a category to a list
   * @param listId the ID of the list
   * @param category the category to add
   * @returns The ID of the created category
   */
  @Post("{listId}/categories")
  @SuccessResponse(201, "Created")
  public async addCategory(@Path() listId: string, @Body() category: CategoryCreationParams): Promise<Pick<Category, "id">> {
    return await ListsService.addCategory(listId, category);
  };

  /**
   * @summary Adds an item to a list
   * @param listId the ID of the list
   * @param item the item to add
   * @returns The ID of the created item
   */
  @Post("{listId}/items")
  @SuccessResponse(201, "Created")
  public async addItem(@Path() listId: string, @Body() item: Item | ItemCreationParams): Promise<Pick<Item, "id">> {
    return await ListsService.addItem(listId, item);
  };

  /**
   * @summary Purchases an item on a list
   * @param listId the ID of the list
   * @param itemId the ID of the item to purchase
   * @returns boolean indicating the success of the operation
   */
  @Post("{listId}/items/{itemId}/purchase")
  @SuccessResponse(201, "Created")
  public async purchaseItem(@Path() listId: string, @Path() itemId: string): Promise<void> {
    await ListsService.purchaseItem(listId, itemId);
    return;
  };

  /**
   * @summary Updates a list
   * @param listId the ID of the list
   * @returns A boolean indicating the success of the operation
   */
  @Put("{listId}")
  @SuccessResponse(205, "Content Updated")
  public async update(@Path() listId: string, @Body() updatedList: List): Promise<void> {
    await ListsService.update(listId, updatedList);
    return;
  };

  /**
   * @summary Deletes a list of items
   * @param listId the ID of the list
   * @returns A boolean indicating the success of the operation
   */
  @Delete("{listId}")
  @SuccessResponse(205, "Content Updated")
  public async delete(@Path() listId: string): Promise<void> {
    await ListsService.delete(listId);
    return;
  };

  /**
   * @summary Removes a category from a list
   * @param listId the ID of the list
   * @param categoryId the ID of the category to remove
   * @returns The list of items
   */
  @Delete("{listId}/categories/{categoryId}")
  @SuccessResponse(205, "Content Updated")
  public async removeCategory(@Path() listId: string, @Path() categoryId: string): Promise<void> {
    await ListsService.removeCategory(listId, categoryId);
    return;
  };

  /**
   * @summary Removes an item from a list
   * @param listId the ID of the list
   * @param itemId the ID of the item to remove
   * @returns The list of items
   */
  @Delete("{listId}/items/{itemId}")
  @SuccessResponse(205, "Content Updated")
  public async removeItem(@Path() listId: string, @Path() itemId: string): Promise<void> {
    await ListsService.removeItem(listId, itemId);
    return;
  };

  /**
   * @summary Retrieves the categories for a list
   * @param listId the ID of the list
   * @returns The list of categories
   */
  @Get("{listId}/categories")
  @SuccessResponse(200, "OK")
  public async getCategories(@Path() listId: string): Promise<Category[]> {
    return await ListsService.getCategories(listId);
  };
};
