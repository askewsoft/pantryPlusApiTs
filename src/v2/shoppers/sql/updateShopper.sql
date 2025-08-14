-- updates a shopper and returns the shopper_id

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @email = :email;
SET @nickname = :nickname;

UPDATE PANTRY_PLUS.SHOPPER
SET EMAIL = @email, NICKNAME = @nickname
WHERE ID = @shopperId
;

SELECT BIN_TO_UUID(ID) as ID
FROM PANTRY_PLUS.SHOPPER
WHERE ID = @shopperId
;
