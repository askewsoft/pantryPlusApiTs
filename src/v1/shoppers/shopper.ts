import { UUID } from "node:crypto";

export interface Shopper {
    id: UUID;
    firstName: string;
    lastName: string;
    email: string;
}

export type ShopperCreationParams = Pick<Shopper, "firstName" | "lastName" | "email">;