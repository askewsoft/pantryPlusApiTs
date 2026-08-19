-- creates a shopping item (v2: always insert the client UUID; names may duplicate)
SET @id = UUID_TO_BIN(:id);
SET @name = LOWER(:name);
SET @nameNormalized = LOWER(TRIM(:name));
SET @upc = :upc;

INSERT IGNORE INTO ITEM (ID, NAME, NAME_NORMALIZED, UPC)
VALUES (@id, @name, @nameNormalized, @upc);