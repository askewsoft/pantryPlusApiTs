-- deletes a shopping list

SET @email = :email;
SET @listId = UUID_TO_BIN(:listId);

SELECT ID into @shopperId
FROM PANTRY_PLUS.SHOPPER
WHERE EMAIL = @email
;

DELETE
FROM LIST
WHERE ID = @listId
  AND OWNER_ID = @shopperId
;