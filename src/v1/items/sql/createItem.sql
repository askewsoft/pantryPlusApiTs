-- creates a shopping item
SET @name = LOWER(:name);
SET @upc = :upc;

INSERT INTO ITEM (NAME, UPC)
VALUES (@name, @upc);

SELECT last_insert_id();