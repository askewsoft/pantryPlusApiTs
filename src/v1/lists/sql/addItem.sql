-- adds a shopping item to a list
SET @name = LOWER(:name);
SET @upc = :upc;
SET @itemIdTxt = :item_id;
SET @listIdTxt = :list_id;
SET @categoryIdTxt = :category_id;

SELECT ID INTO @listId
FROM LIST
WHERE ID_TXT = @listIdTxt
;

-- creates a shopping item if it doesn't exist
IF (@itemIdTxt IS NULL) THEN
    INSERT INTO ITEM (NAME, UPC)
    VALUES (@name, @upc);

    SET @itemId = last_insert_id();
ELSE
    SELECT ID INTO @itemId
    FROM ITEM
    WHERE ID_TXT = @itemIdTxt
    ;
END IF;

-- add the item to the list
INSERT INTO LIST_ITEM_RELATION (LIST_ID, ITEM_ID)
VALUES (@listId, @itemId)
;

-- add the item to the category if it exists
IF (@categoryIdTxt IS NOT NULL) THEN
    SELECT ID INTO @categoryId
    FROM CATEGORY
    WHERE ID_TXT = @categoryIdTxt
    ;

    INSERT INTO ITEM_CATEGORY_RELATION (ITEM_ID, CATEGORY_ID)
    VALUES (@itemId, @categoryId)
    ;
END IF;

SELECT ID_TXT as ID
FROM ITEM
WHERE ID = @itemId
;