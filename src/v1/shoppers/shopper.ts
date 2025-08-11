/**
 * A Shopper is a user who has an account with us.
 */
export interface Shopper {
    /** UUID representation of the shopper's ID
     * @pattern ^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$ Invalid UUID format
     */
    id: string;
    /** The nickname of the shopper */
    nickname: string;
    /** The email of the shopper
     * @pattern ^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$ Invalid email address
    */
    email: string;
}