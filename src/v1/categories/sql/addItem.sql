-- associate a shopping item to a category & it's list
SET @itemId = UUID_TO_BIN(:itemId);
SET @categoryId = UUID_TO_BIN(:categoryId);

-- Look up the list ID for this category
SELECT LIST_ID INTO @listId
FROM CATEGORY
WHERE ID = @categoryId
;

-- add the item to the list
INSERT IGNORE INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
VALUES (@listId, @itemId)
;

-- add the item to the category
INSERT IGNORE INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
VALUES (@itemId, @categoryId)
;

SELECT BIN_TO_UUID(ID) as ID
FROM ITEM
WHERE ID = @itemId
;