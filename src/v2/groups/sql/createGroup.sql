-- creates a group of shoppers
SET @email = :email;
SET @name = :name;
SET @groupId = UUID_TO_BIN(:groupId);

SET @ownerId = (SELECT ID FROM SHOPPER WHERE EMAIL = @email);

INSERT INTO COHORT (ID, NAME, OWNER_ID)
VALUES (@groupId, @name, @ownerId)
;