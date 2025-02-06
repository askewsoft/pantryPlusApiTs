
/**
 * The location of a store at which items may be purchased.
 * GEO_LOCATION is a POINT(longitude, latitude)
 * example: POINT(-71.44508663777015, 42.71299408793443)
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