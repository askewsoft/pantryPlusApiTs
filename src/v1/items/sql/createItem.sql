-- creates a shopping item

SET @name = LOWER(:name);
SET @categoryIdTxt = :category_id;
SET @upc = :upc;

INSERT INTO ITEM (NAME, UPC)
VALUES (@name, @upc)
;

SELECT ID_TXT as ID
FROM ITEM
WHERE ID = last_insert_id()
;
