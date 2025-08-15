-- removes an item from a category
SET @itemId = UUID_TO_BIN(:itemId);
SET @categoryId = UUID_TO_BIN(:categoryId);

SELECT l.ID INTO @listId
FROM CATEGORY c
JOIN LIST l on l.ID = c.LIST_ID
WHERE c.ID = @categoryId
;

DELETE FROM ITEM_CATEGORY_RELATION
WHERE ITEM_ID = @itemId
    AND CATEGORY_ID = @categoryId
;

DELETE FROM LIST_ITEM_RELATION
WHERE ITEM_ID = @itemId
    AND LIST_ID = @listId
;