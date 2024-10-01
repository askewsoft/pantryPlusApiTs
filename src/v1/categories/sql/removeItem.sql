-- removes an item from a category
SET @itemIdTxt = :item_id;
SET @categoryIdTxt = :category_id;

SELECT ID INTO @itemId FROM ITEM WHERE ID_TXT = @itemIdTxt
;
SELECT ID INTO @categoryId FROM CATEGORY WHERE ID_TXT = @categoryIdTxt
;

DELETE FROM ITEM_CATEGORY_RELATION
WHERE ITEM_ID = @itemId
    AND CATEGORY_ID = @categoryId
;