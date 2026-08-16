SET @itemId = UUID_TO_BIN(:itemId);

SELECT
  BIN_TO_UUID(ID) AS id,
  NAME AS name,
  UPC AS upc
FROM ITEM
WHERE ID = @itemId
;
