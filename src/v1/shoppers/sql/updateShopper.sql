-- updates a shopper and returns the shopper_id

SET @shopperId = :shopperId;
SET @email = :email;
SET @firstName = :firstName;
SET @lastName = :lastName;

SET @origFirstName = (SELECT FIRST_NAME FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperId);
SET @origLastName = (SELECT LAST_NAME FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperId);
SET @origEmail = (SELECT EMAIL FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperId);

SET @firstName = (SELECT COALESCE(@firstName, @origFirstName));
SET @lastName = (SELECT COALESCE(@lastName, @origLastName));
SET @email = (SELECT COALESCE(@email, @origEmail));

UPDATE PANTRY_PLUS.SHOPPER
SET EMAIL = @email, FIRST_NAME = @firstName, LAST_NAME = @lastName
WHERE ID_TXT = @shopperId
;

SELECT ID_TXT as ID
FROM PANTRY_PLUS.SHOPPER
WHERE ID_TXT = @shopperId
;
