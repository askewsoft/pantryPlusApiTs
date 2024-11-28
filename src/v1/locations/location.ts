
/**
 * The location of a store at which items may be purchased.
 */
export interface Location {
    /** UUID representation of the location's ID */
    id: string;
    /** The name of the location */
    name: string;
    /** The latitude of the user's current location */
    latitude: number;
    /** The longitude of the user's current location */
    longitude: number;
}