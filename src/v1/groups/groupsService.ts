import path from "path";
import { dbPost, extractDbResult } from "../../shared/dbDriver";
import { Group } from "../groups/group";
import { Item } from "../items/item";
import { Location } from "../locations/location";
import { List } from "../lists/list";
import { ErrorCode } from "../../shared/errorHandler";
import { Shopper } from "../shoppers/shopper";

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
    // TODO: return boolean depending on success or failure of DB call
    return true;
  };

  public static async delete(groupId: string): Promise<boolean> {
    const deleteGroupTemplate = path.join(__dirname, '.sql/deleteGroup.sql');
    // TODO: return boolean depending on success or failure of DB call
    return dbPost(deleteGroupTemplate, groupId);
  };

  public static async get(groupId: string): Promise<Group> {
    const getGroupTemplate = path.join(__dirname, '.sql/getGroup.sql');
    // TODO: return group details from the DB call
    return dbPost(getGroupTemplate, groupId);
  };
};