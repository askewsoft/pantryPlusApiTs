import path from "path";
import { Shopper } from "./shopper";
import { Group } from "../groups/group";
import { Item } from "../items/item";
import { Location } from "../locations/location";
import { List } from "../lists/list";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { ErrorCode } from "../../shared/errorHandler";

export abstract class ShoppersService {
  public static async validateUser(email: string): Promise<Pick<Shopper, "id">> {
    const template = path.join(__dirname, './sql/validateUser.sql');
    const [rows, fields] = await dbPost(template, { email });
    const result = extractDbResult(rows)?.[0];
    if (!result) {
      const err = new Error('shopper not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
    return { id: result?.id };
  };

  public static async retrieve(shopperId: string): Promise<Shopper> {
    const template = path.join(__dirname, './sql/getShopper.sql');
    const [rows] = await dbPost(template, { shopperId });
    const result = extractDbResult(rows)?.[0];
    if (!result) {
      const err = new Error('shopper not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
    return result;
  };

  public static async create(newShopper: Shopper): Promise<Shopper> {
    const template = path.join(__dirname, './sql/createShopper.sql');
    const [rows, fields] = await dbPost(template, newShopper);
    const result = extractDbResult(rows)?.[0];
    return result;
  };

  public static async update(shopperId: string, shopper: Shopper): Promise<Pick<Shopper, "id">> {
    const template = path.join(__dirname, './sql/updateShopper.sql');
    const [rows, fields] = await dbPost(template, { shopperId, ...shopper });
    const result = extractDbResult(rows)?.[0];
    return { id: result?.id };
  };

  public static async getGroups(shopperId: string): Promise<Array<Pick<Group, "id" | "name" | "ownerId">>> {
    const template = path.join(__dirname, './sql/getGroups.sql');
    const [rows, fields] = await dbPost(template, { shopperId });
    const results = extractDbResult(rows);
    return results;
  };

  public static async getItems(shopperId: string): Promise<Array<Item>> {
    const template = path.join(__dirname, './sql/getItems.sql');
    const [rows, fields] = await dbPost(template, { shopperId });
    const results = extractDbResult(rows);
    return results;
  };

  public static async getLists(shopperId: string): Promise<Array<List>> {
    const template = path.join(__dirname, './sql/getLists.sql');
    const [rows, fields] = await dbPost(template, { shopperId });
    const results = extractDbResult(rows);
    return results;
  };

  public static async getLocations(shopperId: string): Promise<Array<Location>> {
    const template = path.join(__dirname, './sql/getLocations.sql');
    const [rows, fields] = await dbPost(template, { shopperId });
    const results = extractDbResult(rows);
    return results;
  };
};