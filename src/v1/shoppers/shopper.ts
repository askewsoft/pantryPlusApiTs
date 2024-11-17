/**
 * A Shopper is a user who has an account with us.
 */
export interface Shopper {
    /** UUID representation of the shopper's ID */
    id: string;
    /** The nickname of the shopper */
    nickName: string;
    /** The email of the shopper
     * @pattern ^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$ Invalid email address
    */
    email: string;
}

export type ShopperCreationParams = Shopper;