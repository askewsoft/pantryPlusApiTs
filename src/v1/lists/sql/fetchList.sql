-- gets a shopper by email

SET @email = :email;
SET @listId = :listId;

SELECT ID_TXT as ID, NAME
FROM LIST
WHERE ID_TXT = @listId
;
