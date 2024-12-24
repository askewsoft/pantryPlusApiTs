-- creates a shopping list and returns the list_id

SET @ownerId = UUID_TO_BIN(:ownerId);
SET @name = :name;
SET @id = UUID_TO_BIN(:id);
SET @ordinal = :ordinal;

INSERT IGNORE INTO LIST (ID, NAME, OWNER_ID)
VALUES (@id, @name, @ownerId)
;

INSERT INTO LIST_ORDER (LIST_ID, SHOPPER_ID, ORDINAL)
VALUES (@id, @ownerId, @ordinal)
ON DUPLICATE KEY UPDATE ORDINAL = @ordinal
;

SELECT BIN_TO_UUID(ID) as ID
FROM LIST
WHERE OWNER_ID = @ownerId
  and NAME = @name
;