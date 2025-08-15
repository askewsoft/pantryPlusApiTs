// LISTS
import { Body, Controller, Delete, Example, Get, Header, Path, Post, Put, Route, Security, SuccessResponse, Tags} from "tsoa";
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
import { validateUUIDParam, validateBodyUUIDs, validateMultipleUUIDs } from "../../shared/uuidValidation";

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
  @Security("bearerAuth")
  public async createList(@Header("X-Auth-User") email: string, @Body() newList: List ): Promise<void> {
    // Validate UUIDs in request body
    validateBodyUUIDs(newList, ['id', 'ownerId', 'groupId'], 'Invalid list ID format');

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
  @Security("bearerAuth")
  public async createCategory(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Body() category: Category): Promise<void> {
    // Validate UUIDs in path and body
    validateUUIDParam('listId', listId);
    validateBodyUUIDs(category, ['id'], 'Invalid category ID format');

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
  @Security("bearerAuth")
  public async addItem(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ listId, itemId });

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
  @Security("bearerAuth")
  public async purchaseItem(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ listId, itemId });

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
  @Security("bearerAuth")
  public async unpurchaseItem(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string, @Path() itemId: string, @Body() purchase: { purchaseDate: string }): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ listId, itemId });

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
  @Security("bearerAuth")
  public async updateList(@Header("X-Auth-User") email: string, @Path() listId: string, @Body() list: Pick<List, "name" | "groupId" | "ordinal">): Promise<void> {
    // Validate UUID path parameter
    validateUUIDParam('listId', listId);

    // Validate UUID in body if groupId is provided
    if (list.groupId) {
      validateUUIDParam('groupId', list.groupId);
    }

    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
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
  @Security("bearerAuth")
  public async deleteList(@Header("X-Auth-User") email: string, @Path() listId: string): Promise<void> {
    // Validate UUID path parameter
    validateUUIDParam('listId', listId);

    await mayProceed({ email, id: listId, accessTemplate: mayUpdateListTemplate });
    await ListsService.delete(listId, email);
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
  @Security("bearerAuth")
  public async removeCategory(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() categoryId: string): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ listId, categoryId });

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
  @Security("bearerAuth")
  public async removeItem(@Header("X-Auth-User") email: string, @Path() listId: string, @Path() itemId: string): Promise<void> {
    // Validate both UUID path parameters
    validateMultipleUUIDs({ listId, itemId });

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
  @Security("bearerAuth")
  public async getCategories(@Header("X-Auth-User") email: string, @Header("X-Auth-Location") locationId: string, @Path() listId: string): Promise<Array<Category>> {
    // Validate UUID path parameter
    validateUUIDParam('listId', listId);

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
  @Security("bearerAuth")
  public async getListItems(@Header("X-Auth-User") email: string, @Path() listId: string): Promise<Array<Item>> {
    // Validate UUID path parameter
    validateUUIDParam('listId', listId);

    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.getListItems(listId);
  };

  /**
   * @summary Retrieves the count of unpurchased items for a list
   * @param email the email address of the user
   * @param listId the ID of the list
   * @example email "test@test.com"
   * @example listId "123E4567-E89B-12D3-A456-426614174000"
   * @returns The count of unpurchased items
   */
  @Get("{listId}/items/count")
  @SuccessResponse(200, "OK")
  @Example<{ count: number }>({ count: 5 })
  @Security("bearerAuth")
  public async getListItemsCount(@Header("X-Auth-User") email: string, @Path() listId: string): Promise<{ count: number }> {
    // Validate UUID path parameter
    validateUUIDParam('listId', listId);

    await mayProceed({ email, id: listId, accessTemplate: mayContributeToListTemplate });
    return await ListsService.getListItemsCount(listId);
  };
};