-- confirm access to alter list
-- only the list owner can make changes

SET @email = :email;
SET @listIdTxt = :id;

SELECT 1 AS ALLOWED
FROM SHOPPER s
LEFT JOIN LIST l ON l.OWNER_ID = s.ID
WHERE s.EMAIL = @email
  and l.ID_TXT = @listId
;