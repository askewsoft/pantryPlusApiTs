import { Group } from "./group";

export const groupExample: Pick<Group, "id" | "name" | "owner"> = {
    id: "123E4567-E89B-12D3-A456-426614174000",
    name: "Family",
    owner: {
        id: "123E4567-E89B-12D3-A456-426614174000",
        nickName: "John",
        email: "john@example.com"
    }
};

export const groupIdExample: Pick<Group, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};

export const groupsExample: Array<Pick<Group, "id" | "name" | "owner">> = [
    groupExample,
    {
        id: "234F5678-F9A0-23D4-B567-537725285000",
        name: "Friends",
        owner: {
            id: "234F5678-F9A0-23D4-B567-537725285000",
            nickName: "Jane",
            email: "jane@example.com"
        }
    }
];