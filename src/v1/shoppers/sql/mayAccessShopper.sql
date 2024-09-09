-- confirm access to alter shopper
-- shoppers may change only their own record

SET @email = :email;
SET @shopperId = :id;

SELECT 1
FROM SHOPPER s
WHERE s.EMAIL = @email
  and s.ID_TXT = @shopperId
;
