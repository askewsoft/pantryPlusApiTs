-- purchases an item on a list
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);
SET @locationId = UUID_TO_BIN(:locationId);
SET @now = NOW();

SELECT NAME INTO @locationName FROM LOCATION WHERE ID = @locationId
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