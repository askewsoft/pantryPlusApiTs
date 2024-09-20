import { GroupsService } from "./groupsService";

// returns the array of results w/o all the MySQL wrapping
export const addAllMembersToGroup = async (groupId: string, members: Array<string>): Promise<Array<string>> => {
    const addShopper = (shopperId: string) : Promise<boolean> => {
        // groupId is handled through closure
        return GroupsService.addShopperToGroup(shopperId, groupId);
    };

    const mappedPromises = members.map(addShopper);
    const shoppersAddedToGroup = await Promise.allSettled(mappedPromises);
    return members.filter((member, index) => shoppersAddedToGroup[index]);
};