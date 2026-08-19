-- removes a purchase from the purchase history
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);
SET @locationId = UUID_TO_BIN(:locationId);
SET @purchaseDate = STR_TO_DATE(:purchaseDate, '%Y-%m-%d');

SELECT NAME INTO @locationName FROM LOCATION WHERE ID = @locationId
;

SELECT ID INTO @historyId
FROM PURCHASE_HISTORY
WHERE LOCATION_ID = @locationId
    AND LIST_ID = @listId
    AND CAST(PURCHASE_DATE AS DATE) = CAST(@purchaseDate AS DATE) 
;

DELETE FROM ITEM_HISTORY_RELATION
WHERE HISTORY_ID = @historyId
    AND ITEM_ID = @itemId
;

-- if there are no more items in the history, delete the purchase history
DELETE FROM PURCHASE_HISTORY
WHERE ID = @historyId
    AND NOT EXISTS (
        SELECT 1
        FROM ITEM_HISTORY_RELATION
        WHERE HISTORY_ID = @historyId
    )
;
