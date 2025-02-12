// LISTS
import { Body, Controller, Delete, Example, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";
import path from "path";

import { List } from "./list";
import { listIdExample } from "./listsExamples";
import { Category } from "../categories/category";
import { categoriesExample } from "../categories/categoriesExamples";
import { Item } from "../items/item";
import { itemsExample } from "../items/itemsExamples";
import { ListsService } from "./listsService";
import { mayProceed } from "../../shared/mayProceed";
import { ShoppersService } from "../shoppers/shoppersService";
import { logger } from "../../shared/logger";

const log = logger("Lists Controller");

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
   * @example newList { "id": "123E4567-E89B-12D3-A456-426614174000", "name": "Grocery List", "ownerId": "123E4567-E89B-12D3-A456-426614174000", "groupId": "123E4567-E89B-12D3-A456-426614174000", "ordinal": 1 }
   * @returns The ID of the created list
   */
  @Post()
  @SuccessResponse(201, "Created")
  @Example<Pick<List, "id">>(listIdExample)
  public async createList(@Header("X-Auth-User") email: string, @Body() newList: List ): Promise<void> {
    // any valid user can create a list
    await ShoppersService.validateUser(email);
    await ListsService.create(email, newList);
    return;
  };

  /**
   * @summary Adds a category to a list
   * @param email the email address of the user
   * @param locationId the ID of the user's nearest store location
   * @param listId the ID of the list
   * @param category the category to add
   * @example email "test@test.com"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example category { "id": "123E4567-E89B-12D3-A456-426614174000", "name": "Produce" }
   */
  @Post("{listId}/categories")
  @SuccessResponse(201, "Created")
  public async createCategory(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Body() category: Category): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.createCategory(listId, category, locationId);
    return;
  };

  /**
   * @summary Associates an item with a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param itemId the ID of the item to associate with the list
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   */
  @Post("{listId}/items/{itemId}")
  @SuccessResponse(201, "Created")
  public async addItem(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    log.debug(`adding item ${itemId} to list ${listId} for user ${email}`);
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.addItem(listId, itemId);
    return;
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
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.purchaseItem(email, listId, itemId, locationId);
    return;
  };

  /**
   * @summary Removes the purchase of an item from purchase history
   * @param email the email address of the user
   * @param locationId the ID of the location
   * @param listId the ID of the list
   * @param itemId the ID of the item to remove
   * @param purchase an object containing the date of purchase
   * @example email "test@test.com"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example itemId "123E4567-E89B-12D3-A456-426614174000"
   * @example purchase {"purchaseDate": "2024-02-29"}
   */
  @Delete("{listId}/items/{itemId}/purchase")
  @SuccessResponse(204, "No Content")
  public async unpurchaseItem(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Path() itemId: string, @Body() purchase: { purchaseDate: string }): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.unpurchaseItem(listId, itemId, locationId, purchase.purchaseDate);
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
  public async updateList(@Header("X-Auth-User") email: string, @Path() listId: string, @Body() list: Pick<List, "name" | "groupId" | "ordinal">): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayUpdateListTemplate });
    await ListsService.update(email, listId, list.name, list.groupId ?? "", list.ordinal);
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
  @SuccessResponse(204, "No Content")
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
  @SuccessResponse(204, "No Content")
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
  @SuccessResponse(204, "No Content")
  public async removeItem(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    await ListsService.removeItem(listId, itemId);
    return;
  };

  /**
   * @summary Retrieves the categories for a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @param locationId the ID of the location
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @example locationId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The list of categories
   */
  @Get("{listId}/categories")
  @SuccessResponse(200, "OK")
  @Example<Array<Category>>(categoriesExample)
  public async getCategories(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string): Promise<Array<Category>> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.getCategories(listId, locationId);
  };

  /**
   * @summary Retrieves the uncategorized items for a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The list of items
   */
  @Get("{listId}/items")
  @SuccessResponse(200, "OK")
  @Example<Array<Item>>(itemsExample)
  public async getItems(@Header("X-Auth-User") email: string, @Path() listId: string): Promise<Array<Item>> {
    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.getItems(listId);
  };
};