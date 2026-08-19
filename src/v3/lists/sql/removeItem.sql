-- removes an uncategorized item from a list
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);

-- TODO: consider validation to ensure item is not in a category

DELETE FROM LIST_ITEM_RELATION
WHERE ITEM_ID = @itemId
    AND LIST_ID = @listId
;