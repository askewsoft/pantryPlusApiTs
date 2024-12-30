-- creates a shopping list and returns the list_id
SET @userEmail = :userEmail;
SET @name = :name;
SET @listId = UUID_TO_BIN(:listId);
SET @ordinal = :ordinal;

SELECT ID INTO @ownerId
FROM SHOPPER
WHERE EMAIL = @userEmail
;

INSERT IGNORE INTO LIST (ID, NAME, OWNER_ID)
VALUES (@listId, @name, @ownerId)
;

INSERT INTO LIST_ORDER (LIST_ID, SHOPPER_ID, ORDINAL)
VALUES (@listId, @ownerId, @ordinal)
ON DUPLICATE KEY UPDATE ORDINAL = @ordinal
;

SELECT BIN_TO_UUID(ID) as ID
FROM LIST
WHERE OWNER_ID = @ownerId
  and NAME = @name
;