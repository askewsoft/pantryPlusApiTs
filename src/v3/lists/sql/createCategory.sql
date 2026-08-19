-- adds a category to a shopping list and returns the category_id

SET @listId = UUID_TO_BIN(:listId);
SET @name = :name;
SET @categoryId = UUID_TO_BIN(:id);
SET @ordinal = :ordinal;
SET @locationId = UUID_TO_BIN(NULLIF(:locationId, ''));

INSERT IGNORE INTO CATEGORY (ID, NAME, LIST_ID)
VALUES (@categoryId, @name, @listId)
;

INSERT IGNORE INTO CATEGORY_ORDER (CATEGORY_ID, LOCATION_ID, ORDINAL)
VALUES (@categoryId, @locationId, CAST(@ordinal as UNSIGNED))
;

SELECT BIN_TO_UUID(ID) as ID
FROM CATEGORY
WHERE LIST_ID = @listId
  and NAME = @name
;