export interface Shopper {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export type ShopperCreationParams = Pick<Shopper, "firstName" | "lastName" | "email">;