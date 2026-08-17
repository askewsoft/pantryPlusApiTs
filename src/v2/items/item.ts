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