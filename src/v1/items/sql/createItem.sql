-- creates a shopping item
SET @IdTxt = :id;
SET @name = LOWER(:name);
SET @upc = :upc;

INSERT IGNORE INTO ITEM (ID, NAME, UPC)
VALUES (UUID_TO_BIN(@IdTxt), @name, @upc);

SELECT UUID_TO_BIN(ID) as ID
FROM ITEM
WHERE ID = UUID_TO_BIN(@IdTxt)
;