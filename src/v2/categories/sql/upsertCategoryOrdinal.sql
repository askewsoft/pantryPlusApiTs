SET @categoryId = UUID_TO_BIN(:categoryId);
SET @locationId = UUID_TO_BIN(:locationId);
SET @categoryOrdinal = :categoryOrdinal;

INSERT INTO CATEGORY_ORDER (CATEGORY_ID, LOCATION_ID, ORDINAL)
VALUES (@categoryId, @locationId, CAST(@categoryOrdinal as UNSIGNED))
ON DUPLICATE KEY UPDATE
    ORDINAL = CAST(@categoryOrdinal as UNSIGNED)
;
