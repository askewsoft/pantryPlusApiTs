-- gets all categories for a shopping list

SET @listId = UUID_TO_BIN(:listId);

SELECT BIN_TO_UUID(c.ID) as ID, c.NAME, co.ORDINAL
FROM CATEGORY c
LEFT JOIN CATEGORY_ORDER co 
    ON co.CATEGORY_ID = c.ID
WHERE c.LIST_ID = @listId
;
