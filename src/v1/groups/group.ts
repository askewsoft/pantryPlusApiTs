/**
 * An array of group member Shopper IDs
 */
export type GroupMembers = Array<string>;

/**
 * A Group is a user generated collection of Shoppers.
 */
export type Group = {
    /** UUID representation of the groups's ID */
    id: string;
    /** The name of the group */
    name: string;
    /** The shopper that originally created the group */
    ownerId: string;
    /** The members of this group by shopper ID */
    members: GroupMembers
}

export type GroupCreationParams = Pick<Group, "name" | "members">;

export type GroupCreationResponse = Pick<Group, "id" | "members">;