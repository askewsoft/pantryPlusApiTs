-- get all uncategorized items in a list
SET @listId = UUID_TO_BIN(:listId);

SELECT
  BIN_TO_UUID(id) AS id,
  name,
  upc
FROM ITEM i
JOIN LIST_ITEM_RELATION lir 
    ON lir.item_id = i.id
LEFT JOIN ITEM_CATEGORY_RELATION icr
    ON icr.item_id = i.id
WHERE icr.category_id IS NULL
  AND lir.list_id = @listId
;
