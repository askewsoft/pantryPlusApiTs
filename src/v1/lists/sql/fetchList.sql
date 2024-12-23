-- gets a shopper by email

SET @email = :email;
SET @listId = UUID_TO_BIN(:listId);

SELECT BIN_TO_UUID(ID) as ID, NAME
FROM LIST
WHERE ID = @listId
;