SET @categoryIdTxt = :categoryId;
SET @categoryNameTxt = :categoryName;
SET @categoryOrdinal = :categoryOrdinal;
SET @locationIdTxt = :locationId;

SET @locationId = IF(@locationIdTxt IS NOT NULL, UUID_TO_BIN(@locationIdTxt), UUID_TO_BIN('340e7a07-be43-11ef-8727-0242ac120002'));
SET @categoryId = UUID_TO_BIN(@categoryIdTxt);

UPDATE CATEGORY
SET NAME = @categoryNameTxt
WHERE ID = @categoryId
;

-- upsert category ordinal
INSERT INTO CATEGORY_ORDER (CATEGORY_ID, LOCATION_ID, ORDINAL)
VALUES (@categoryId, @locationId, CAST(@categoryOrdinal as UNSIGNED))
ON DUPLICATE KEY UPDATE
    ORDINAL = CAST(@categoryOrdinal as UNSIGNED)
;