-- gets a shopper by ID
SET @shopperId = :shopperId;

SELECT ID_TXT as ID, NICKNAME, EMAIL
FROM PANTRY_PLUS.SHOPPER
WHERE ID_TXT = @shopperId
;
