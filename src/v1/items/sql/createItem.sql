-- creates a shopping item

SET @name = LOWER(:name);
SET @categoryIdTxt = :category_id;
SET @upc = :upc;

INSERT INTO ITEM (NAME, UPC)
VALUES (@name, @upc)
;

SET @itemId = last_insert_id();

INSERT INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
VALUES (@itemId, @categoryIdTxt)
;

SELECT @itemId as ID
;