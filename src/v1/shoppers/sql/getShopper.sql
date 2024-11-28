-- gets a shopper by email

SET @shopperId = :shopperId;

SELECT ID_TXT as ID, NICKNAME, EMAIL
FROM PANTRY_PLUS.SHOPPER
WHERE ID_TXT = @shopperId
;
