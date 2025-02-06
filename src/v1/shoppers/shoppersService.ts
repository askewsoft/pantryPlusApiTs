import path from "path";
import { Shopper } from "./shopper";
import { Group } from "../groups/group";
import { Item } from "../items/item";
import { Location } from "../locations/location";
import { List } from "../lists/list";
import { dbPost } from "../../shared/dbDriver";
import { ErrorCode } from "../../shared/errorHandler";

export abstract class ShoppersService {
  public static async validateUser(email: string): Promise<Pick<Shopper, "id">> {
    const template = path.join(__dirname, './sql/validateUser.sql');
    const results = await dbPost(template, { email });
    const result = results?.[0];
    if (!result) {
      const err = new Error('shopper not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
    return { id: result?.id };
  };

  public static async retrieve(shopperId: string): Promise<Shopper> {
    const template = path.join(__dirname, './sql/getShopper.sql');
    const results = await dbPost(template, { shopperId });
    const result = results?.[0];
    if (!result) {
      const err = new Error('shopper not found') as any;
      err.name = ErrorCode.NOT_FOUND;
      throw err;
    }
    return result;
  };

  public static async create(newShopper: Shopper): Promise<Shopper> {
    const template = path.join(__dirname, './sql/createShopper.sql');
    const results = await dbPost(template, newShopper);
    const result = results?.[0];
    return result;
  };

  public static async update(shopperId: string, shopper: Shopper): Promise<Pick<Shopper, "id">> {
    const template = path.join(__dirname, './sql/updateShopper.sql');
    const results = await dbPost(template, { shopperId, ...shopper });
    const result = results?.[0];
    return { id: result?.id };
  };

  public static async getGroups(shopperId: string): Promise<Array<Group>> {
    const template = path.join(__dirname, './sql/getGroups.sql');
    const results = await dbPost(template, { shopperId });
    const groups = results.map((group: any) => ({
      id: group.id,
      name: group.name,
      owner: {
        id: group.ownerId,
        nickname: group.ownerNickname,
        email: group.ownerEmail
      }
    }));
    return groups;
  };

  public static async getInvites(shopperId: string): Promise<Array<Group>> {
    const template = path.join(__dirname, './sql/getInvites.sql');
    const results = await dbPost(template, { shopperId });
    const invites = results.map((invite: any) => ({
      id: invite.id,
      name: invite.name,
      owner: {
        id: invite.ownerId,
        nickname: invite.ownerNickname,
        email: invite.ownerEmail
      }
    }));
    return invites;
  };

  public static async declineInvite(shopperId: string, inviteId: string): Promise<void> {
    const template = path.join(__dirname, './sql/declineInvite.sql');
    await dbPost(template, { shopperId, inviteId });
  };

  public static async acceptInvite(shopperId: string, inviteId: string): Promise<void> {
    const template = path.join(__dirname, './sql/acceptInvite.sql');
    await dbPost(template, { shopperId, inviteId });
  };

  public static async getItems(shopperId: string): Promise<Array<Item>> {
    const template = path.join(__dirname, './sql/getPurchasedItems.sql');
    const results = await dbPost(template, { shopperId });
    return results;
  };

  public static async getLists(shopperId: string): Promise<Array<List>> {
    const template = path.join(__dirname, './sql/getLists.sql');
    const results = await dbPost(template, { shopperId });
    return results;
  };

  public static async getLocations(shopperId: string): Promise<Array<Location>> {
    const template = path.join(__dirname, './sql/getLocations.sql');
    const results = await dbPost(template, { shopperId });
    const locations = results.map((location: any) => ({
      id: location.id,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude
    }));
    return locations;
  };
};