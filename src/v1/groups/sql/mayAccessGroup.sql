-- confirm access to view group
-- groups may be viewed by any member or owner

SET @userEmail = :email;
SET @groupIdTxt = :id;

SELECT ID INTO @groupId FROM GROUP WHERE ID_TXT = @groupIdTxt
;
SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM GROUP g
WHERE g.OWNER_ID = @shopperId
  AND g.ID = @groupId
UNION
SELECT 1 AS ALLOWED
FROM GROUP_SHOPPER_RELATION gsr
WHERE gsr.SHOPPER_ID = @shopperId
  AND gsr.GROUP_ID = @groupId
;