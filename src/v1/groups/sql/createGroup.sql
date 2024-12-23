-- creates a group of shoppers and return its group_id

SET @email = :email;
SET @name = :name;

SET @ownerId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT INTO COHORT (NAME, OWNER_ID)
VALUES (@name, @ownerId)
;

SELECT BIN_TO_UUID(ID) as ID
FROM COHORT
WHERE OWNER_ID = @ownerId
  and NAME = @name
;