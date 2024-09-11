-- removes a category from a shopping list

SET @listIdTxt = :listId;
SET @categoryIdTxt = :categoryId;

SET @listId = (SELECT ID FROM LIST WHERE ID_TXT = @listIdTxt);

DELETE
FROM CATEGORY
WHERE LIST_ID = @listId
  and ID_TXT = @categoryIdTxt
;

SELECT ROW_COUNT() as ROW_COUNT;
