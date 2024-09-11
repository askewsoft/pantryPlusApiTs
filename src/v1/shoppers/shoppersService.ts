import path from "path";
import { Shopper, ShopperCreationParams } from "./shopper";
import { Group } from "../groups/group";
import { Item } from "../items/item";
import { Location } from "../locations/location";
import { List } from "../lists/list";
import { dbPost, extractDbResult } from "../../shared/dbDriver";

export abstract class ShoppersService {
  public static async retrieve(shopperId: string): Promise<Shopper> {
    const template = path.join(__dirname, './sql/getShopper.sql');
    const [rows] = await dbPost(template, { shopperId });
    const result = extractDbResult(rows)?.[0];
    if (!result) {
      const err = new Error('user not found');
      err.name = 'NOT_FOUND';
      throw err;
    }
    return result;
  }

  public static async create(newShopper: ShopperCreationParams): Promise<Shopper> {
    const template = path.join(__dirname, './sql/createShopper.sql');
    const [rows, fields] = await dbPost(template, newShopper);
    const result = extractDbResult(rows)?.[0];
    return result;
  }

  public static async update(shopperId: string, shopper: Shopper): Promise<string> {
    const template = path.join(__dirname, './sql/updateShopper.sql');
    const [rows, fields] = await dbPost(template, { shopperId, shopper });
    const result = extractDbResult(rows)?.[0];
    return result?.id;
  }

  public static async getGroups(shopperId: string): Promise<Array<Group>> {
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
}