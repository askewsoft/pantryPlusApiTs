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
        FROM COHORT
        WHERE OWNER_ID = @shopperId
            AND ID = l.COHORT_ID
        UNION
        SELECT 1
        FROM COHORT_SHOPPER_RELATION csr
        WHERE csr.SHOPPER_ID = @shopperId
            AND csr.COHORT_ID = l.COHORT_ID
    ) 
;