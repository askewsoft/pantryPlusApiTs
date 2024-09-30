-- removes a purchase from the purchase history
SET @itemIdTxt = :item_id;
SET @listIdTxt = :list_id;
SET @locationIdTxt = :location_id;
SET @purchaseDateTxt = :purchase_date;
SET @purchaseDate = STR_TO_DATE(@purchaseDateTxt, '%Y-%m-%d');

SELECT ID INTO @itemId FROM ITEM WHERE ID_TXT = @itemIdTxt
;
SELECT ID INTO @listId FROM LIST WHERE ID_TXT = @listIdTxt
;
SELECT ID, NAME INTO @locationId, @locationName FROM LOCATION WHERE ID_TXT = @locationIdTxt
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
