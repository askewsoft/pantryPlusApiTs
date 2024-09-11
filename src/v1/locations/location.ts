
/**
 * The location of a store at which items may be purchased.
 */
export interface Location {
    /** UUID representation of the location's ID */
    id: string;
    /** The name of the location */
    name: string;
    /** From what or whom this location info was originally provided */
    source: string;
}

export type LocationCreationParams = Pick<Location, "name" | "source">;