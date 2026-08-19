-- creates a shopping item (caller supplies display name + normalized uniqueness key)
SET @id = UUID_TO_BIN(:id);
SET @name = :name;
SET @nameNormalized = :nameNormalized;
SET @upc = :upc;

INSERT INTO ITEM (ID, NAME, NAME_NORMALIZED, UPC)
VALUES (@id, @name, @nameNormalized, @upc);
