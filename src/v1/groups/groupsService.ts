import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { GroupGetResponse } from "../groups/group";
import { Shopper } from "../shoppers/shopper";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Group Service')

export abstract class GroupsService {
  public static async create(name: string, email: string): Promise<string> {
    const createTemplate = path.join(__dirname, '.sql/createGroup.sql');
    const [rows, fields] = await dbPost(createTemplate, { name, email });
    const results = extractDbResult(rows);
    const groupId = results[0].id;
    return groupId;
  };

  public static async addShopperToGroup(shopperId: string, groupId: string): Promise<boolean> {
    const addToGroupTemplate = path.join(__dirname, '.sql/addShopperToGroup.sql');
    try {
      await dbPost(addToGroupTemplate, {shopperId, groupId});
    } catch (err: any) {
      log.warn(`Unable to attach shopper ${shopperId} to group ${groupId}: ${err.message}`); 
      return false;
    }
    return true;
  };

  public static async removeAllShoppersFromGroup(groupId: string): Promise<boolean> {
    const removeAllFromGroupTemplate = path.join(__dirname, '.sql/removeAllShoppersFromGroup.sql');
    try {
      await dbPost(removeAllFromGroupTemplate, { groupId });
    } catch (err: any) {
      log.warn(`Unable to remove all shoppers from group ${groupId}: ${err.message}`); 
      return false;
    }
    return true;
  };

  public static async delete(groupId: string): Promise<boolean> {
    const deleteGroupTemplate = path.join(__dirname, '.sql/deleteGroup.sql');
    try {
      await dbPost(deleteGroupTemplate, groupId);
    } catch (err: any) {
      log.error(`Unable to delete group ${groupId}: ${err.message}`); 
      return false;
    }
    return true;
  };

  public static async get(groupId: string): Promise<GroupGetResponse> {
    const getGroupTemplate = path.join(__dirname, '.sql/getGroup.sql');
    return dbPost(getGroupTemplate, groupId);
  };

  public static async update(groupId: string, name: string): Promise<boolean> {
    const updateGroupTemplate = path.join(__dirname, '.sql/updateGroupName.sql');
    try {
      await dbPost(updateGroupTemplate, { groupId, name });
    } catch (err: any) {
      log.error(`Unable to update group ${groupId}: ${err.message}`); 
      return false;
    }
    return true;
  };

  public static async getGroupShoppers(groupId: string): Promise<Array<Shopper>> {
    const getGroupShoppersTemplate = path.join(__dirname, '.sql/getGroupShoppers.sql');
    const [rows, fields] = await dbPost(getGroupShoppersTemplate, { groupId });
    return extractDbResult(rows);
  };
};