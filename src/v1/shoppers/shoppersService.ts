import path from "path";
import { UUID } from "node:crypto";
import { Shopper, ShopperCreationParams } from "./shopper";
import { dbPost, extractDbResult } from "../../shared/dbDriver";

export abstract class ShoppersService {
  public static async retrieve(shopperId: UUID): Promise<Shopper> {
    const template = path.join(__dirname, 'getShopper.sql');
    const [rows] = await dbPost(template, { shopperId });
    const results = extractDbResult(rows)?.[0];
    if (!results) {
      const err = new Error('user not found');
      err.name = 'NOT_FOUND';
      throw err;
    }
    return results;
  }

  public static async create(newShopper: ShopperCreationParams): Promise<Shopper> {
    const template = path.join(__dirname, 'createShopper.sql');
    const [rows, fields] = await dbPost(template, newShopper);
    const results = extractDbResult(rows);
    return results;
  }
}