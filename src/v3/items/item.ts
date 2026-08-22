/**
 * An Item is something a user may purchase.
 */
export interface Item {
    /** UUID representation of the item's ID
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ Invalid UUID format
     */
    id: string;
    /** The name of the item */
    name: string;
    /** The universal product code of the item */
    upc?: string;
    /** Category on the target list to auto-assign when re-adding; omitted when unknown */
    categoryId?: string;
}

/**
 * Payload for renaming an item on a specific list.
 * The returned item id may differ from the path id (find-existing or fork).
 */
export interface ItemUpdate {
    /** The display name to apply */
    name: string;
    /** The universal product code of the item */
    upc?: string;
    /**
     * List whose membership should be re-pointed on find-existing or fork.
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ Invalid UUID format
     */
    listId: string;
}

/**
 * An alternate search name that resolves to an ITEM without merging rows.
 */
export interface ItemAlias {
    /** Display form of the alias (e.g. "coke") */
    name: string;
}

/**
 * Body for registering a new alias on an item.
 */
export interface ItemAliasCreate {
    /** The alias text shoppers may type or speak */
    name: string;
}