-- removes a category from a shopping list

SET @listId = UUID_TO_BIN(:listId);
SET @categoryId = UUID_TO_BIN(:categoryId);

DELETE
FROM CATEGORY
WHERE LIST_ID = @listId
  and ID = @categoryId
;

SELECT ROW_COUNT() as ROW_COUNT;
