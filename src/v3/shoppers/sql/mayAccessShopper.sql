-- confirm access to alter shopper
-- shoppers may change only their own record

SET @userEmail = :email;
SET @shopperId = UUID_TO_BIN(:id);

SELECT 1 AS ALLOWED
FROM PANTRY_PLUS.SHOPPER s
WHERE s.EMAIL = @userEmail
  and s.ID = @shopperId
;
