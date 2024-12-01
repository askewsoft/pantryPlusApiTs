// LISTS
import { Body, Controller, Delete, Example, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { List } from "./list";
import { listIdExample } from "./listsExamples";
import { Category } from "../categories/category";
import { categoriesExample, categoryIdExample } from "../categories/categoriesExamples";
import { Item } from "../items/item";
import { itemIdExample } from "../items/itemsExamples";
import { ListsService } from "./listsService";
import { mayProceed } from "../../shared/mayProceed";
import { CategoriesService } from "../categories/categoriesService";
import { userInfo } from "os";

const mayUpdateListTemplate = path.join(__dirname, './sql/mayUpdateList.sql');
const mayContributeToListTemplate = path.join(__dirname, './sql/mayContributeToList.sql');

@Route("lists")
@Tags("Lists")
export class ListsController extends Controller {
  /**
   * @summary Creates a new list of items
   * @param email the email address of the user
   * @param newList the list to create
   * @example email "test@test.com"
   * @example newList { "id": "123E4567-E89B-12D3-A456-426614174000", "name": "Grocery List", "ownerId": "123E4567-E89B-12D3-A456-426614174000" }
   * @returns The ID of the created list
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Example<Pick<List, "id">>(listIdExample)
  public async createList(@Header("X-Auth-User") email: string, @Body() newList: List ): Promise<Pick<List, "id">> {
    // any authenticated user can create a list
    return await ListsService.create(newList);
  };

  /**
   * @summary Adds a category to a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param category the category to add
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example category { "id": "123E4567-E89B-12D3-A456-426614174000", "name": "Produce" }
   * @returns The ID of the created category
   */
  @Post("{listId}/categories")
  @SuccessResponse(201, "Created")
  @Example<Pick<Category, "id">>(categoryIdExample)
  public async addCategory(@Header("X-Auth-User") email: string, @Path() listId: string, @Body() category: Category): Promise<Pick<Category, "id">> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.addCategory(listId, category);
  };

  /**
   * @summary Adds an item to a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param item the item to add
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example item { "id": "123E4567-E89B-12D3-A456-426614174000", "name": "Tomato", "categoryId": "123E4567-E89B-12D3-A456-426614174000" }
   * @returns The ID of the created item
   */
  @Post("{listId}/items")
  @SuccessResponse(201, "Created")
  @Example<Pick<Item, "id">>(itemIdExample)
  public async addItem(@Header("X-Auth-User") email: string, @Path() listId: string, @Body() item: Item): Promise<Pick<Item, "id">> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.addItem(listId, item);
  };

  /**
   * @summary Purchases an item on a list
   * @param email the email address of the user
   * @param locationId the ID of the location
   * @param listId the ID of the list
   * @param itemId the ID of the item to purchase
   * @example email "test@test.com"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Post("{listId}/items/{itemId}/purchase")
  @SuccessResponse(201, "Created")
  public async purchaseItem(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    // TODO: validate user taking the action and submit their ID to the service
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.purchaseItem(listId, itemId, locationId);
    return;
  };

  /**
   * @summary Removes the purchase of an item from purchase history
   * @param email the email address of the user
   * @param locationId the ID of the location
   * @param listId the ID of the list
   * @param itemId the ID of the item to remove
   * @param purchaseDate the date of purchase
   * @example email "test@test.com"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   * @example purchaseDate "2024-02-29"
   */
  @Delete("{listId}/items/{itemId}/purchase")
  @SuccessResponse(205, "Content Updated")
  public async unpurchaseItem(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Path() itemId: string, @Body() purchaseDate: string): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    // TODO: validate user taking the action and submit their ID to the service
    await ListsService.unpurchaseItem(listId, itemId, locationId, purchaseDate);
    return;
  };

  /**
   * @summary Updates a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param updatedList the updated list
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example updatedList { "name": "Grocery List", "ownerId": "123E4567-E89B-12D3-A456-426614174000", "groupId": "123E4567-E89B-12D3-A456-426614174000" }
   */
  @Put("{listId}")
  @SuccessResponse(205, "Content Updated")
  public async updateList(@Header("X-Auth-User") email: string, @Path() listId: string, @Body() updatedList: List): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayUpdateListTemplate });
    await ListsService.update(listId, updatedList);
    return;
  };

  /**
   * @summary Deletes a list of items
   * @param email the email address of the user
   * @param listId the ID of the list
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Delete("{listId}")
  @SuccessResponse(205, "Content Updated")
  public async deleteList(@Header("X-Auth-User") email: string, @Path() listId: string): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayUpdateListTemplate });
    await ListsService.delete(listId);
    return;
  };

  /**
   * @summary Removes a category from a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param categoryId the ID of the category to remove
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Delete("{listId}/categories/{categoryId}")
  @SuccessResponse(205, "Content Updated")
  public async removeCategory(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() categoryId: string): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.removeCategory(listId, categoryId);
    return;
  };

  /**
   * @summary Removes an item from a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param itemId the ID of the item to remove
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Delete("{listId}/items/{itemId}")
  @SuccessResponse(205, "Content Updated")
  public async removeItem(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.removeItem(listId, itemId);
    return;
  };

  /**
   * @summary Retrieves the categories for a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The list of categories
   */
  @Get("{listId}/categories")
  @SuccessResponse(200, "OK")
  @Example<Array<Pick<Category, "id" | "name">>>(categoriesExample)
  public async getCategories(@Header("X-Auth-User") email: string, @Path() listId: string): Promise<Array<Pick<Category, "id" | "name">>> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.getCategories(listId);
  };


  /**
   * @summary Retrieves the items for a category
   * @param email the email address of the user
   * @param categoryId the ID of the category
   * @example email "test@test.com"
   * @example categoryId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The list of items
   */
  @Get("{listId}/categories/{categoryId}/items")
  @SuccessResponse(200, "OK")
  public async getItems(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() categoryId: string): Promise<Array<Item>> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.getCategoryItems(listId, categoryId);
  };
};
