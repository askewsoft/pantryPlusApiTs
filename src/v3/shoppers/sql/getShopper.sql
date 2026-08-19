-- gets a shopper by ID
SET @shopperId = UUID_TO_BIN(:shopperId);

SELECT BIN_TO_UUID(ID) as ID, NICKNAME, EMAIL
FROM PANTRY_PLUS.SHOPPER
WHERE ID = @shopperId
;