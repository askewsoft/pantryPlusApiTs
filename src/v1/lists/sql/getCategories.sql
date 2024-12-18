-- gets all categories for a shopping list

SET @listIdTxt = :listId;

SELECT bin_to_uuid(c.ID) as ID, c.NAME, co.ORDINAL
FROM CATEGORY c
LEFT JOIN CATEGORY_ORDER co 
    ON co.CATEGORY_ID = c.ID
WHERE c.LIST_ID = uuid_to_bin(@listIdTxt)
;