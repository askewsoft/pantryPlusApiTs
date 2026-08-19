-- creates a shopper and returns the shopper_id

SET @email = :email;
SET @nickname = :nickname;
SET @id = UUID_TO_BIN(:id);

-- Use INSERT IGNORE to handle duplicate emails gracefully
-- If email exists but with different ID, this indicates a Cognito/DB mismatch
-- that will be handled in the application layer
INSERT IGNORE INTO PANTRY_PLUS.SHOPPER (ID, EMAIL, NICKNAME)
VALUES (@id, @email, @nickname)
;