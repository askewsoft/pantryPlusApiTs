import { Location } from "./location";

export const locationsExample: Array<Location> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Stop & Shop Nashua",
        latitude: 42.7456,
        longitude: -71.4910
    }
];

export const locationIdExample: Pick<Location, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};