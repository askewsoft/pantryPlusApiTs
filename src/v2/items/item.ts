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
 * v2 update body. `id` is ignored (path itemId wins) but 1.5.4 sends it;
 * listing it avoids TSOA throw-on-extras.
 */
export interface ItemUpdateBody {
    name: string;
    upc?: string;
    /** UUID of the item; optional because some clients only send name/upc */
    id?: string;
}