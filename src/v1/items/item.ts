/**
 * An Item is something a user may purchase.
 */
export interface Item {
    /** UUID representation of the item's ID
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Invalid UUID format
     */
    id: string;
    /** The name of the item */
    name: string;
    /** The universal product code of the item */
    upc?: string;
}