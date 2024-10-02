-- confirm access to alter group
-- groups may be changed or deleted by owner only

SET @userEmail = :email;
SET @groupIdTxt = :id;

SELECT ID INTO @groupId FROM GROUP WHERE ID_TXT = @groupIdTxt
;
SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1
FROM GROUP g
WHERE g.OWNER_ID = @shopperId
  AND g.ID = @groupId
;