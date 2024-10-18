import { CategoryResponse } from "./category";

export const categoriesExample: Array<CategoryResponse> = [
    {
        id: "123E4567-E89B-12D3-A456-426614174000",
        name: "Produce"
    },
    {
        id: "123E4567-E89B-12D3-A456-426614174001",
        name: "Dairy"
    }
];

export const categoryIdExample: Pick<CategoryResponse, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};