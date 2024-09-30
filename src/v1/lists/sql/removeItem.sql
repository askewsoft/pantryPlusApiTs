-- removes an item from a list
SET @itemIdTxt = :item_id;
SET @listIdTxt = :list_id;

SELECT ID INTO @itemId FROM ITEM WHERE ID_TXT = @itemIdTxt
;
SELECT ID INTO @listId FROM LIST WHERE ID_TXT = @listIdTxt
;

-- leaves the item in the item_category_relation table for future reference

DELETE FROM LIST_ITEM_RELATION
WHERE ITEM_ID = @itemId
    AND LIST_ID = @listId
;