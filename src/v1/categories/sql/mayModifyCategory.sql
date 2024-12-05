-- confirm access to modify category
-- categories may be modified by any shopper with access to the list to which the category belongs

SET @userEmail = :email;
SET @categoryIdTxt = :id;

SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM CATEGORY c
JOIN LIST l
    ON l.ID = c.LIST_ID
    AND l.OWNER_ID = @shopperId
WHERE c.ID = UUID_TO_BIN(@categoryIdTxt)
UNION
SELECT 1 AS ALLOWED
FROM CATEGORY c
JOIN LIST l ON l.ID = c.LIST_ID
JOIN GROUP g ON g.ID = l.GROUP_ID
JOIN GROUP_SHOPPER_RELATION gsr
    ON gsr.GROUP_ID = g.ID
    AND gsr.SHOPPER_ID = @shopperId
WHERE c.ID = UUID_TO_BIN(@categoryIdTxt)
;