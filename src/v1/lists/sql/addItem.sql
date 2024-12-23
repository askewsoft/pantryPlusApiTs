-- adds a shopping item to a list without a category
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);

-- add the item to the list
INSERT INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
VALUES (@listId, @itemId)
;

SELECT BIN_TO_UUID(ID) as ID
FROM ITEM
WHERE ID = @itemId
;
