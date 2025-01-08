-- creates a group of shoppers
SET @email = :email;
SET @name = :name;

SET @ownerId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT INTO COHORT (NAME, OWNER_ID)
VALUES (@name, @ownerId)
;