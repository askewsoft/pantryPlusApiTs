-- deletes a shopping list

SET @email = :email;
SET @listId = :listId;

SELECT ID into @shopperId
FROM PANTRY_PLUS.SHOPPER
WHERE EMAIL = @email
;

DELETE
FROM LIST
WHERE ID_TXT = @listId
  AND OWNER_ID = @shopperId
;

SELECT ROW_COUNT() as ROW_COUNT;
