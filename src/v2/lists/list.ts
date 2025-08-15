/**
 * A List is a grouping of items.
 */
export interface List {
    /** UUID representation of the list's ID
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
     */
    id: string;
    /** The name of the list */
    name: string;
    /** The shopper that originally created the list
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
     */
    ownerId: string;
    /** The group of users with whom this list is shared
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$
     */
    groupId?: string | undefined;
    /** The ordinal of the list */
    ordinal: number;
}