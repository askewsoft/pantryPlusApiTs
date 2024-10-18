import { List } from "./list";

export const listsExample: Array<List> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Grocery List",
        ownerId: "123E4567-E89B-12D3-A456-426614174000"
    }
];

export const listIdExample: Pick<List, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};