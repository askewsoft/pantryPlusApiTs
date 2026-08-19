-- 1 if this ITEM is a member of the given list
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);

SELECT 1 AS onList
FROM LIST_ITEM_RELATION
WHERE ITEM_ID = @itemId
  AND LIST_ID = @listId
LIMIT 1
;
