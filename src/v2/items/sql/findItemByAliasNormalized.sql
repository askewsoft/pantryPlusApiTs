SET @aliasNormalized = :aliasNormalized;

SELECT
  BIN_TO_UUID(it.ID) AS id,
  it.NAME AS name,
  it.UPC AS upc
FROM ITEM_ALIAS ia
JOIN ITEM it ON it.ID = ia.ITEM_ID
WHERE ia.ALIAS_NORMALIZED = @aliasNormalized
LIMIT 1
;
