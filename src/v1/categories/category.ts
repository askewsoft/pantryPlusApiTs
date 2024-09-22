/**
 * A category is a grouping of related items within a list.
 */
export interface Category {
    /** UUID representation of the category's ID */
    id: string;
    /** The name of the category */
    name: string;
    /** The list to which the category belongs */
    listId: string;
}

// TODO: add category ID
export type CategoryCreationParams = Omit<Category, "id">;