-- gets all categories for a shopping list
SET @locationId = UUID_TO_BIN(:locationId);
SET @listId = UUID_TO_BIN(:listId);

SELECT
    BIN_TO_UUID(c.ID) as ID,
    c.NAME,
    CAST(COALESCE(co.ORDINAL, ROW_NUMBER() OVER (ORDER BY NAME)) AS UNSIGNED) as ORDINAL 
FROM CATEGORY c
LEFT JOIN CATEGORY_ORDER co 
    ON co.CATEGORY_ID = c.ID
    AND co.LOCATION_ID = @locationId
WHERE c.LIST_ID = @listId
ORDER BY ORDINAL
;
