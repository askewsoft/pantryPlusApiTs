-- get all uncategorized items in a list
SET @listId = UUID_TO_BIN(:listId);

SELECT
  BIN_TO_UUID(i.id) AS id,
  i.name,
  i.upc
FROM LIST_ITEM_RELATION lir
JOIN ITEM i 
    ON i.id = lir.item_id
LEFT JOIN ITEM_CATEGORY_RELATION icr
    ON icr.item_id = i.id
WHERE icr.category_id IS NULL
    AND lir.list_id = @listId
;
