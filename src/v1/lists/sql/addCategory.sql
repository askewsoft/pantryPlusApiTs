-- adds a category to a shopping list and returns the category_id

SET @listIdTxt = :listId;
SET @name = :name;

SET @listId = (SELECT ID FROM LIST WHERE ID_TXT = @listIdTxt);

INSERT INTO CATEGORY (NAME, LIST_ID)
VALUES (@name, @listId)
;

SELECT ID_TXT as ID
FROM CATEGORY
WHERE LIST_ID = @listId
  and NAME = @name
;
