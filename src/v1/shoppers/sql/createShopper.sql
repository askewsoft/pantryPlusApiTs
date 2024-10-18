-- creates a shopper and returns the shopper_id

SET @email = :email;
SET @firstName = :firstName;
SET @lastName = :lastName;

INSERT INTO PANTRY_PLUS.SHOPPER (EMAIL, FIRST_NAME, LAST_NAME)
VALUES (@email, @firstName, @lastName)
;

SELECT ID_TXT as ID
FROM PANTRY_PLUS.SHOPPER
WHERE EMAIL = @email
;
