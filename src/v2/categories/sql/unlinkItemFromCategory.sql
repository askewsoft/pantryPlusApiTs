-- Removes an item from a category without removing it from the list
SET @itemId = UUID_TO_BIN(:itemId);
SET @categoryId = UUID_TO_BIN(:categoryId);

DELETE FROM ITEM_CATEGORY_RELATION
WHERE ITEM_ID = @itemId
    AND CATEGORY_ID = @categoryId
;
