-- gets all categories for a shopping list

SET @listIdTxt = :listId;

SET @listId = (SELECT ID FROM LIST WHERE ID_TXT = @listIdTxt);

SELECT ID_TXT as ID, NAME
FROM CATEGORY
WHERE LIST_ID = @listId
;
