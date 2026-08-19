SET @categoryId = UUID_TO_BIN(:categoryId);
SET @categoryName = :categoryName;
SET @categoryOrdinal = :categoryOrdinal;
SET @locationId = UUID_TO_BIN(:locationId);

UPDATE CATEGORY
SET NAME = @categoryName
WHERE ID = @categoryId
;

-- upsert category ordinal
INSERT INTO CATEGORY_ORDER (CATEGORY_ID, LOCATION_ID, ORDINAL)
VALUES (@categoryId, @locationId, CAST(@categoryOrdinal as UNSIGNED))
ON DUPLICATE KEY UPDATE
    ORDINAL = CAST(@categoryOrdinal as UNSIGNED)
;