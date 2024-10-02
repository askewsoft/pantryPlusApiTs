-- confirm access to modify category
-- categories may be modified by any shopper with access to the list to which the category belongs

SET @userEmail = :email;
SET @categoryIdTxt = :id;

SELECT ID INTO @categoryId FROM CATEGORY WHERE ID_TXT = @categoryIdTxt
;
SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1
FROM CATEGORY c
JOIN LIST l
    ON l.ID = c.LIST_ID
WHERE c.ID = @categoryId
    AND EXISTS (
        SELECT 1
        FROM GROUP
        WHERE OWNER_ID = @shopperId
        AND ID = l.GROUP_ID
        UNION
        SELECT 1
        FROM GROUP_SHOPPER_RELATION gsr
        WHERE gsr.SHOPPER_ID = @shopperId
        AND gsr.GROUP_ID = l.GROUP_ID
    )