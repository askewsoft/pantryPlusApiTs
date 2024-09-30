-- purchases an item on a list
SET @itemIdTxt = :item_id;
SET @listIdTxt = :list_id;
SET @locationIdTxt = :location_id;
SET @now = NOW();

SELECT ID INTO @itemId FROM ITEM WHERE ID_TXT = @itemIdTxt
;
SELECT ID INTO @listId FROM LIST WHERE ID_TXT = @listIdTxt
;
SELECT ID, NAME INTO @locationId, @locationName FROM LOCATION WHERE ID_TXT = @locationIdTxt
;
SELECT c.NAME, c.ID INTO @categoryName, @categoryId
FROM CATEGORY c
JOIN ITEM_CATEGORY_RELATION icr
    ON icr.ITEM_ID = @itemId
JOIN LIST_ITEM_RELATION lir
    ON lir.ITEM_ID = @itemId
    AND lir.LIST_ID = c.listId
WHERE icr.CATEGORY_ID = c.ID
    AND c.LIST_ID = @listId
;

SELECT ID INTO @historyId
FROM PURCHASE_HISTORY
WHERE LOCATION_ID = @locationId
    AND LIST_ID = @listId
    AND CATEGORY_ID = @categoryId
    AND CAST(PURCHASE_DATE AS DATE) = CAST(@now AS DATE) 
;

-- insert into purchase history if it doesn't exist
IF (@historyId IS NULL) THEN
    INSERT INTO PURCHASE_HISTORY (LOCATION_ID, LIST_ID, PURCHASE_DATE, LOCATION_NAME, CATEGORY_ID, CATEGORY_NAME)
    VALUES (@locationId, @listId, @now, @locationName, @categoryId, @categoryName);
    SET @historyId = LAST_INSERT_ID();
END IF;

-- update the item's purchased status
INSERT INTO ITEM_HISTORY_RELATION (ITEM_ID, HISTORY_ID)
VALUES (@itemId, @historyId)
;