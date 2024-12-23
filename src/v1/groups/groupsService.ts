import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Group } from "../groups/group";
import { Shopper } from "../shoppers/shopper";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Group Service')

export abstract class GroupsService {
  public static async create(name: string, email: string): Promise<string> {
    const createTemplate = path.join(__dirname, './sql/createGroup.sql');
    const results = await dbPost(createTemplate, { name, email });
    const groupId = results[0].id;
    return groupId;
  };

  public static async addShopperToGroup(shopperId: string, groupId: string): Promise<boolean> {
    const addToGroupTemplate = path.join(__dirname, './sql/addShopperToGroup.sql');
    try {
      await dbPost(addToGroupTemplate, {shopperId, groupId});
    } catch (err: any) {
      log.warn(`Unable to attach shopper ${shopperId} to group ${groupId}: ${err.message}`);
      return false;
    }
    return true;
  };

  public static async removeAllShoppersFromGroup(groupId: string): Promise<void> {
    const removeAllFromGroupTemplate = path.join(__dirname, './sql/removeAllShoppersFromGroup.sql');
    return await dbPost(removeAllFromGroupTemplate, { groupId });
  };

  public static async delete(groupId: string): Promise<void> {
    const deleteGroupTemplate = path.join(__dirname, './sql/deleteGroup.sql');
    return await dbPost(deleteGroupTemplate, groupId);
  };

  public static async get(groupId: string): Promise<Pick<Group, "id" | "name" | "ownerId">> {
    const getGroupTemplate = path.join(__dirname, './sql/getGroup.sql');
    return dbPost(getGroupTemplate, groupId);
  };

  public static async update(groupId: string, name: string): Promise<void> {
    const updateGroupTemplate = path.join(__dirname, './sql/updateGroupName.sql');
    return await dbPost(updateGroupTemplate, { groupId, name });
  };

  public static async getGroupShoppers(groupId: string): Promise<Array<Shopper>> {
    const getGroupShoppersTemplate = path.join(__dirname, './sql/getGroupShoppers.sql');
    const results = await dbPost(getGroupShoppersTemplate, { groupId });
    return results;
  };
};
