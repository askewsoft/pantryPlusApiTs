import { Shopper } from "./shopper";

export const shopperExample: Shopper = {
    id: "123E4567-E89B-12D3-A456-426614174000",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com"
  };

  export const shopperIdExample: Pick<Shopper, "id"> = {
    id: "123E4567-E89B-12D3-A456-426614174000"
  };

  export const shoppersExample: Array<Shopper> = [
    shopperExample,
    {
        id: "234F5678-F9A0-23D4-B567-537725285000",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane.doe@example.com"
    }
];