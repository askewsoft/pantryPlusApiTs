// LISTS
import { Body, Controller, Delete, Get, Header, Path, Post, Put, Route, SuccessResponse, Tags} from "tsoa";

import { List, ListCreationParams } from "./list";
import { ListsService } from "./listsService";
import { ErrorCode } from "../../shared/errorHandler";

@Route("lists")
@Tags("Lists")
export class ListsController extends Controller {
  /**
   * @summary Creates a new list of items
   * @param email - the email address of the user
   * @returns The ID of the created list
   */
  @Post()
  @SuccessResponse(201, "Created")
  public async create(@Header("X-Auth-User") email: string, @Body() newList: ListCreationParams ): Promise<string> {
    try {
      const listId = await ListsService.create(newList);
      return listId;
    } catch (err: any) {
      err.code = ErrorCode.DATABASE_ERR
      throw err;
    }
  };
};