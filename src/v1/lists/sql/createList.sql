-- creates a shopping list and returns the list_id

SET @ownerId = :ownerId;
SET @name = :name;
SET @idTxt = :id;

INSERT IGNORE INTO LIST (ID, NAME, OWNER_ID)
VALUES (uuid_to_bin(@idTxt), @name, uuid_to_bin(@ownerId))
;

SELECT ID_TXT as ID
FROM LIST
WHERE OWNER_ID = uuid_to_bin(@ownerId)
  and NAME = @name
;