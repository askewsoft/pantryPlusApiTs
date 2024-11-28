import { Group } from "./group";

export const groupCreationExample: Pick<Group, "id" | "members"> = {
    id: "123E4567-E89B-12D3-A456-426614174000",
    members: [
        "123E4567-E89B-12D3-A456-426614174000",
        "234F5678-F9A0-23D4-B567-537725285000"
    ]
};

export const groupExample: Pick<Group, "id" | "name" | "ownerId"> = {
    id: "123E4567-E89B-12D3-A456-426614174000",
    name: "Family",
    ownerId: "123E4567-E89B-12D3-A456-426614174000"
};

export const groupIdExample: Pick<Group, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
};

export const groupsExample: Array<Pick<Group, "id" | "name" | "ownerId">> = [
    groupExample,
    {
        id: "234F5678-F9A0-23D4-B567-537725285000",
        name: "Friends",
        ownerId: "234F5678-F9A0-23D4-B567-537725285000"
    }
];