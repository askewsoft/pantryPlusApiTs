-- confirm access to alter shopper
-- shoppers may change only their own record

SET @userEmail = :email;
SET @shopperIdTxt = :id;

SELECT 1
FROM SHOPPER s
WHERE s.EMAIL = @userEmail
  and s.ID_TXT = @shopperIdTxt
;