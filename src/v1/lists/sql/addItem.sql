-- adds a shopping item to a list without a category
SET @itemIdTxt = :itemId;
SET @listIdTxt = :listId;

-- add the item to the list
INSERT INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
VALUES (UUID_TO_BIN(@listIdTxt), UUID_TO_BIN(@itemIdTxt))
;

SELECT BIN_TO_UUID(ID) as ID
FROM ITEM
WHERE ID = UUID_TO_BIN(@itemIdTxt)
;