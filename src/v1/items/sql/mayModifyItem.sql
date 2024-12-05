-- confirm access to modify item
-- items may be modified by any shopper with access to the list to which the item belongs

SET @userEmail = :email;
SET @itemIdTxt = :id;

SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM ITEM i
JOIN LIST_ITEM_RELATION lir
    ON lir.ITEM_ID = i.ID
JOIN LIST l
    ON l.ID = lir.LIST_ID
WHERE i.ID = UUID_TO_BIN(@itemIdTxt)
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
;