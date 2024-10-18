-- confirm access to alter shopper
-- shoppers may change only their own record

SET @userEmail = :email;
SET @shopperIdTxt = :id;

SELECT 1 as allowed
FROM PANTRY_PLUS.SHOPPER s
WHERE s.EMAIL = @userEmail
  and s.ID_TXT = @shopperIdTxt
;