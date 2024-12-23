-- creates a shopping list and returns the list_id

SET @ownerId = UUID_TO_BIN(:ownerId);
SET @name = :name;
SET @id = UUID_TO_BIN(:id);

INSERT IGNORE INTO LIST (ID, NAME, OWNER_ID)
VALUES (@id, @name, @ownerId)
;

SELECT BIN_TO_UUID(ID) as ID
FROM LIST
WHERE OWNER_ID = @ownerId
  and NAME = @name
;