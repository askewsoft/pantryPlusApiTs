/**
 * A category is a grouping of related items within a list.
 */
export interface Category {
    /** UUID representation of the category's ID
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Invalid UUID format
     */
    id: string;
    /** The name of the category */
    name: string;
    /** The list to which the category belongs
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Invalid UUID format
     */
    listId: string;
    /** The ordinal of the category */
    ordinal: number;
}