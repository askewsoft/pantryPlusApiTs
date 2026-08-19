-- Find an item by its normalized name (case/whitespace-insensitive key)
SET @nameNormalized = :nameNormalized;

SELECT
  BIN_TO_UUID(ID) AS id,
  NAME AS name,
  UPC AS upc
FROM ITEM
WHERE NAME_NORMALIZED = @nameNormalized
LIMIT 1
;
