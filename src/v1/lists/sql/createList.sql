-- creates a shopping list and returns the list_id

SET @email = :email;
SET @name = :name;

SET @ownerId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT INTO LIST (NAME, OWNER_ID)
VALUES (@name, @ownerId)
;

SELECT ID_TXT as ID
FROM LIST
WHERE OWNER_ID = @ownerId
  and NAME = @name
;
