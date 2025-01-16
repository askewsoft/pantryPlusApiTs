import path from "path";
import { dbPost } from "../../shared/dbDriver";
import { Group } from "../groups/group";
import { Shopper } from "../shoppers/shopper";
import { Logger, logger } from "../../shared/logger";

const log: Logger = logger('Group Service')

export abstract class GroupsService {
  public static async create(name: string, email: string, groupId: string): Promise<void> {
    const createTemplate = path.join(__dirname, './sql/createGroup.sql');
    return await dbPost(createTemplate, { name, email, groupId });
  };

  public static async addShopperToGroup(shopperId: string, groupId: string): Promise<void> {
    const addToGroupTemplate = path.join(__dirname, './sql/addShopperToGroup.sql');
    return await dbPost(addToGroupTemplate, {shopperId, groupId});
  };

  public static async inviteShopper(groupId: string, shopperEmail: string): Promise<void> {
    const inviteShopperTemplate = path.join(__dirname, './sql/inviteShopper.sql');
    return await dbPost(inviteShopperTemplate, {groupId, shopperEmail});
  };

  public static async uninviteShopper(groupId: string, shopperEmail: string): Promise<void> {
    const uninviteShopperTemplate = path.join(__dirname, './sql/uninviteShopper.sql');
    return await dbPost(uninviteShopperTemplate, {groupId, shopperEmail});
  };

  public static async removeShopperFromGroup(groupId: string, shopperId: string): Promise<void> {
    const removeShopperFromGroupTemplate = path.join(__dirname, './sql/removeShopperFromGroup.sql');
    return await dbPost(removeShopperFromGroupTemplate, { groupId, shopperId });
  };

  public static async delete(groupId: string): Promise<void> {
    const deleteGroupTemplate = path.join(__dirname, './sql/deleteGroup.sql');
    return await dbPost(deleteGroupTemplate, groupId);
  };

  public static async get(groupId: string): Promise<Pick<Group, "id" | "name" | "owner">> {
    const getGroupTemplate = path.join(__dirname, './sql/getGroup.sql');
    const results = await dbPost(getGroupTemplate, groupId);
    const group = results[0];
    return {
      id: group.id,
      name: group.name,
      owner: {
        id: group.owner_id,
        nickname: group.owner_nickname,
        email: group.owner_email
      }
    };
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

  public static async getInvitees(groupId: string): Promise<Array<Pick<Shopper, "email">>> {
    const getInviteesTemplate = path.join(__dirname, './sql/getInvitees.sql');
    const results = await dbPost(getInviteesTemplate, { groupId });
    log.debug(`retrieved invitees = ${JSON.stringify(results)}`);
    return results;
  };
};
