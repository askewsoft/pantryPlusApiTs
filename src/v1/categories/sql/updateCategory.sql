SET @categoryIdTxt = :categoryId;
SET @categoryNameTxt = :categoryName;
SET @categoryOrdinal = :categoryOrdinal;

UPDATE CATEGORY
SET NAME = @categoryNameTxt
WHERE ID = UUID_TO_BIN(@categoryIdTxt)
;

UPDATE CATEGORY_ORDER
SET ORDINAL = CAST(@categoryOrdinal as UNSIGNED)
WHERE CATEGORY_ID = UUID_TO_BIN(@categoryIdTxt)
;