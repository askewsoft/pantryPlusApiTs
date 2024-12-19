-- adds a category to a shopping list and returns the category_id

SET @listIdTxt = :listId;
SET @name = :name;
SET @categoryIdTxt = :id;
SET @ordinal = :ordinal;

INSERT IGNORE INTO CATEGORY (ID, NAME, LIST_ID)
VALUES (uuid_to_bin(@categoryIdTxt), @name, uuid_to_bin(@listIdTxt))
;

INSERT IGNORE INTO CATEGORY_ORDER (CATEGORY_ID, ORDINAL)
VALUES (uuid_to_bin(@categoryIdTxt), CAST(@ordinal as UNSIGNED))
;

SELECT bin_to_uuid(ID) as ID
FROM CATEGORY
WHERE LIST_ID = uuid_to_bin(@listIdTxt)
  and NAME = @name
;