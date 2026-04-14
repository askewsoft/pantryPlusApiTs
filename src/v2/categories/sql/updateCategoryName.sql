SET @categoryId = UUID_TO_BIN(:categoryId);
SET @categoryName = :categoryName;

UPDATE CATEGORY
SET NAME = @categoryName
WHERE ID = @categoryId
;
