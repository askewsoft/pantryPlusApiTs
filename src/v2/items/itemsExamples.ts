import { Item } from "./item";

export const itemsExample: Array<Item> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Ketchup",
        upc: "123456789012"
    }
];

export const itemIdExample: Pick<Item, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};