-- purchases an item on a list
SET @userEmail = :userEmail;
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);
SET @locationId = UUID_TO_BIN(:locationId);
SET @now = DATE(NOW());
SET @categoryName = NULL;

SELECT NAME INTO @locationName FROM LOCATION WHERE ID = @locationId
;

SELECT ID INTO @userId
FROM SHOPPER
WHERE EMAIL = @userEmail
;

-- One category name for this list only (item may be categorized on other lists)
SELECT c.NAME INTO @categoryName
FROM ITEM_CATEGORY_RELATION icr
JOIN CATEGORY c
    ON c.ID = icr.CATEGORY_ID
   AND c.LIST_ID = @listId
WHERE icr.ITEM_ID = @itemId
LIMIT 1
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

-- Idempotent: same item on today's history at this location is a no-op
INSERT IGNORE INTO ITEM_HISTORY_RELATION (ITEM_ID, PURCHASE_HISTORY_ID, PURCHASED_BY, CATEGORY_NAME, ITEM_NAME)
SELECT @itemId, @historyId, @userId, @categoryName, i.NAME
FROM ITEM i
WHERE i.ID = @itemId
;
