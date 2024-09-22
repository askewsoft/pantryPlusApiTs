import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { ListCreationParams } from "./list";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('List Service')

export abstract class ListsService {
  public static async create(list: ListCreationParams): Promise<string> {
    const { name, ownerId, groupId } = list;
    const createTemplate = path.join(__dirname, '.sql/createList.sql');
    const [rows, fields] = await dbPost(createTemplate, { name, ownerId, groupId });
    const results = extractDbResult(rows);
    const listId = results[0].id;
    return listId;
  };
};