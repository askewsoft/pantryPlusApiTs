/**
 * An Item is something a user may purchase.
 */
export interface Item {
    /** UUID representation of the item's ID */
    id: string;
    /** The name of the item */
    name: string;
    /** The universal product code of the item */
    upc?: string;
    /** The ID of the category to which this item belongs */
    categoryId?: string;
}

export type ItemCreationParams = Omit<Item, "id">;