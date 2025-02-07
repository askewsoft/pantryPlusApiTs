
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

export interface NearbyLocation extends Location {
    /** The distance from the user's current location to the location */
    distance: number;
}

export interface RecentLocation extends Location {
    /** The date of the purchase */
    lastPurchaseDate: string;
}

export interface LocationArea {
    /** The latitude of the user's current location */
    latitude: number;
    /** The longitude of the user's current location */
    longitude: number;
    /** The radius of the search */
    radius: number;
}