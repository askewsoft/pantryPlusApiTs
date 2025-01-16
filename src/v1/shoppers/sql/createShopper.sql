-- creates a shopper and returns the shopper_id

SET @email = :email;
SET @nickname = :nickname;
SET @id = UUID_TO_BIN(:id);

INSERT IGNORE INTO PANTRY_PLUS.SHOPPER (ID, EMAIL, NICKNAME)
VALUES (@id, @email, @nickname)
;

SELECT BIN_TO_UUID(ID) as ID
FROM PANTRY_PLUS.SHOPPER
WHERE EMAIL = @email
;
