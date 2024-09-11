-- creates a group of shoppers and return its group_id

SET @email = :email;
SET @name = :name;

SET @ownerId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT INTO GROUP (NAME, OWNER_ID)
VALUES (@name, @ownerId)
;

SELECT ID_TXT as ID
FROM GROUP
WHERE OWNER_ID = @ownerId
  and NAME = @name
;
