/**
 * A Shopper is a user who has an account with us.
 */
export interface Shopper {
    /** UUID representation of the shopper's ID */
    id: string;
    /** The first name of the shopper */
    firstName: string;
    /** The last name of the shopper */
    lastName: string;
    /** The email of the shopper */
    email: string;
}

export type ShopperCreationParams = Pick<Shopper, "firstName" | "lastName" | "email">;