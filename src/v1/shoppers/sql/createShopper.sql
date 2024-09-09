-- creates a shopper and returns the shopper_id

SET @email = :email;
SET @firstName = :firstName;
SET @lastName = :lastName;

INSERT INTO SHOPPER (EMAIL, FIRST_NAME, LAST_NAME)
VALUES (@email, @firstName, @lastName)
;

SELECT ID_TXT as ID
FROM SHOPPER
WHERE EMAIL = @email
;
