SET @categoryIdTxt = :categoryId;
SET @categoryNameTxt = :categoryName;
SET @categoryOrdinal = :categoryOrdinal;

UPDATE CATEGORY
SET
    NAME = @categoryNameTxt,
    ORDINAL = CAST(@categoryOrdinal as UNSIGNED)
WHERE ID = UUID_TO_BIN(@categoryIdTxt)
;