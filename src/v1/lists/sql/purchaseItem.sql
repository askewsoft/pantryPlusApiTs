-- purchases an item on a list
SET @userEmail = :userEmail;
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);
SET @locationId = UUID_TO_BIN(:locationId);
SET @now = DATE(NOW());

SELECT NAME INTO @locationName FROM LOCATION WHERE ID = @locationId
;

SELECT ID INTO @userId
FROM SHOPPER
WHERE EMAIL = @userEmail
;

SELECT c.NAME INTO @categoryName
FROM ITEM i
LEFT JOIN ITEM_CATEGORY_RELATION icr
    ON icr.ITEM_ID = i.ID
LEFT JOIN CATEGORY c
    ON c.ID = icr.CATEGORY_ID
    AND c.LIST_ID = @listId
WHERE i.ID = @itemId
;

-- insert into purchase history if it doesn't exist
INSERT IGNORE INTO PURCHASE_HISTORY (LOCATION_ID, LIST_ID, PURCHASE_DATE, LOCATION_NAME)
VALUES (@locationId, @listId, @now, @locationName);

-- get the history ID whether it was just inserted or already existed
SELECT ID INTO @historyId 
FROM PURCHASE_HISTORY 
WHERE LIST_ID = @listId 
    AND PURCHASE_DATE = @now
    AND LOCATION_ID = @locationId
;

-- update the item's purchased status
INSERT INTO ITEM_HISTORY_RELATION (ITEM_ID, PURCHASE_HISTORY_ID, PURCHASED_BY, CATEGORY_NAME)
VALUES (@itemId, @historyId, @userId, @categoryName)
;