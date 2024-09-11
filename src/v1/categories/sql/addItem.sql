-- adds a shopping item to a category

SET @categoryIdTxt = :category_id;
SET @itemIdTxt = :item_id;

SELECT ID INTO @categoryId
FROM CATEGORY
WHERE ID_TXT = @categoryIdTxt
;

SELECT ID INTO @itemId
FROM ITEM
WHERE ID_TXT = @itemIdTxt
;

INSERT INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
VALUES (@itemId, @categoryId)
;

SELECT ROW_COUNT() as ROW_COUNT;
