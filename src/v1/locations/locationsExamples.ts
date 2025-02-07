import { Location, NearbyLocation, RecentLocation } from "./location";

export const locationsExample: Array<Location> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Stop & Shop Nashua",
        latitude: 42.7456,
        longitude: -71.4910
    }
];

export const recentLocationsExample: Array<RecentLocation> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Stop & Shop Nashua",
        latitude: 42.7456,
        longitude: -71.4910,
        lastPurchaseDate: "2024-01-01"
    },
    {
        id: "123E4567-E89B-12D3-A456-426614174001",
        name: "Stop & Shop Nashua",
        latitude: 42.7456,
        longitude: -71.4910,
        lastPurchaseDate: "2024-01-02"
    }
];
export const nearbyLocationsExample: Array<NearbyLocation> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Stop & Shop Nashua",
        latitude: 42.7456,
        longitude: -71.4910,
        distance: 100
    },
    {
        id: "123E4567-E89B-12D3-A456-426614174001",
        name: "Stop & Shop Nashua",
        latitude: 42.7456,
        longitude: -71.4910,
        distance: 200
    }
];

export const locationIdExample: Pick<Location, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};