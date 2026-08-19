import { Category } from "./category";

export const categoriesExample: Array<Category> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Produce",
        listId: "123E4567-E89B-12D3-A456-426614174000",
        ordinal: 1
    },
    {
        id: "123E4567-E89B-12D3-A456-426614174001",
        name: "Dairy",
        listId: "123E4567-E89B-12D3-A456-426614174000",
        ordinal: 2
    }
];

export const categoryIdExample: Pick<Category, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};