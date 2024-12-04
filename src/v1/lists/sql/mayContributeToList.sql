-- confirm access to contribute to list
-- list owner and group members can contribute

SET @userEmail = :email;
SET @listIdTxt = :id;

SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM LIST
WHERE OWNER_ID = @shopperId
  and ID = uuid_to_bin(@listIdTxt)
UNION
SELECT 1 AS ALLOWED
FROM LIST l
JOIN GROUP_SHOPPER_RELATION gsr
    ON gsr.SHOPPER_ID = @shopperId
    AND gsr.GROUP_ID = l.GROUP_ID
WHERE l.ID = uuid_to_bin(@listIdTxt)
;