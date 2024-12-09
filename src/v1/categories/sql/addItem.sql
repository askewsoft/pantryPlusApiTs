-- associate a shopping item to a category & it's list
SET @itemIdTxt = :itemId;
SET @categoryIdTxt = :categoryId;

-- Look up the list ID for this category
SELECT LIST_ID INTO @listId
FROM CATEGORY
WHERE ID = UUID_TO_BIN(@categoryIdTxt)
;

-- add the item to the list
INSERT IGNORE INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
VALUES (@listId, UUID_TO_BIN(@itemIdTxt))
;

-- add the item to the category
INSERT IGNORE INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
VALUES (UUID_TO_BIN(@itemIdTxt), UUID_TO_BIN(@categoryIdTxt))
;

SELECT BIN_TO_UUID(ID) as ID
FROM ITEM
WHERE ID = UUID_TO_BIN(@itemIdTxt)
;