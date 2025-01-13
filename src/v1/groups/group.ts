/**
 * An array of group member Shopper IDs
 */
import { Shopper } from "../shoppers/shopper";
export type GroupMembers = Array<string>;

/**
 * A Group is a user generated collection of Shoppers.
 */
export type Group = {
    /** UUID representation of the group's ID */
    id: string;
    /** The name of the group */
    name: string;
    /** The shopper that originally created the group */
    owner: Shopper;
}