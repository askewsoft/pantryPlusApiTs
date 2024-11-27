-- creates a shopping list and returns the list_id

SET @email = :email;
SET @name = :name;
SET @idTxt = :id;

SET @ownerId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT IGNORE INTO LIST (ID, NAME, OWNER_ID)
VALUES (uuid_to_bin(@idTxt), @name, @ownerId)
;

SELECT ID_TXT as ID
FROM LIST
WHERE OWNER_ID = @ownerId
  and NAME = @name
;