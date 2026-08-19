-- confirms that a user email is an existing shopper
SET @email = :email;

SELECT BIN_TO_UUID(ID) as ID
FROM PANTRY_PLUS.SHOPPER
WHERE EMAIL = @email
;
