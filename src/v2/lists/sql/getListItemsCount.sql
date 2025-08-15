-- get count of all unpurchased items in a list (both categorized and uncategorized)
SET @listId = UUID_TO_BIN(:listId);

SELECT COUNT(*) as count
FROM LIST_ITEM_RELATION lir
WHERE lir.LIST_ID = @listId
; 