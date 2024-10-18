-- gets a shopper by email

SET @shopperId = :shopperId;

SELECT ID_TXT as ID, FIRST_NAME, LAST_NAME, EMAIL
FROM PANTRY_PLUS.SHOPPER
WHERE ID_TXT = @shopperId
;
