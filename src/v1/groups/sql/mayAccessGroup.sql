-- confirm access to alter group
-- groups may be changed or deleted by owner only

SET @email = :email;
SET @groupId = :id;

SELECT 1
FROM GROUP g
JOIN SHOPPER s
  on s.EMAIL = @email
WHERE g.OWNER_ID = s.ID
  AND g.ID_TXT = @groupId
;
