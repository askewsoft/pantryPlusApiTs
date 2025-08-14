-- creates a shopping item
SET @id = UUID_TO_BIN(:id);
SET @name = LOWER(:name);
SET @upc = :upc;

INSERT IGNORE INTO ITEM (ID, NAME, UPC)
VALUES (@id, @name, @upc);

SELECT BIN_TO_UUID(ID) as ID
FROM ITEM
WHERE ID = @id
;