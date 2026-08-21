-- Removes an item from a shopping list (membership only).
-- ITEM_CATEGORY_RELATION is kept so re-add can auto-assign the last category.
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);

DELETE FROM LIST_ITEM_RELATION
WHERE ITEM_ID = @itemId
  AND LIST_ID = @listId
;
