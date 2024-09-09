-- gets a shopper by email

SET @shopperId = :shopperId;

SELECT ID_TXT as ID, FIRST_NAME, LAST_NAME, EMAIL
FROM SHOPPER
WHERE SHOPPER_ID_TXT = @shopperId
;
