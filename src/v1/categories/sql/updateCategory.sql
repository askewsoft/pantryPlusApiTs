SET @categoryIdTxt = :categoryId;
SET @categoryNameTxt = :categoryName;

UPDATE CATEGORY
SET NAME = @categoryNameTxt
WHERE ID = UUID_TO_BIN(@categoryIdTxt)
;