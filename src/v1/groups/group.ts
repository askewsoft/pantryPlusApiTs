/**
 * A Group is a user generated collection of Shoppers.
 */
export interface Group {
    /** UUID representation of the groups's ID */
    id: string;
    /** The name of the group */
    name: string;
    /** The shopper that originally created the group */
    ownerId: string;
}

export type GroupCreationParams = Pick<Group, "name">;