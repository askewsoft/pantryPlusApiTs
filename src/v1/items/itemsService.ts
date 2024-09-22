import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { Logger, logger } from "../../shared/logger";
import { ErrorCode } from "../../shared/errorHandler";

const log: Logger = logger('Item Service')

export abstract class ItemsService {
  public static async create(name: string, upc?: string): Promise<string> {
    const createTemplate = path.join(__dirname, '.sql/createItem.sql');
    try {
        const [rows] = await dbPost(createTemplate, { name, upc });
        const results = extractDbResult(rows);
        const itemId = results[0].id;
        return itemId;
    } catch (err: any) {
        err.code = ErrorCode.DATABASE_ERR;
        throw err;
    }   
  };
};