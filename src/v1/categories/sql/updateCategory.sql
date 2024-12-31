SET @categoryId = UUID_TO_BIN(:categoryId);
SET @categoryName = :categoryName;
SET @categoryOrdinal = :categoryOrdinal;
SET @locationId = IF(:locationId IS NOT NULL, UUID_TO_BIN(:locationId), UUID_TO_BIN('123e4567-e89b-12d3-a456-426614174000'));

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