
/**
 * A List is a grouping of items.
 */
export interface List {
    /** UUID representation of the list's ID */
    id: string;
    /** The name of the list */
    name: string;
    /** The shopper that originally created the list */
    ownerId: string;
    /** The group of users with whom this list is shared */
    groupId?: string | undefined;
}

export type ListCreationParams = Omit<List, "id">;