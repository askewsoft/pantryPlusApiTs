-- Inventory: all items alphabetically (case-insensitive)
SELECT
  BIN_TO_UUID(ID) AS id,
  NAME AS name,
  NAME_NORMALIZED AS name_normalized,
  UPC AS upc
FROM ITEM
ORDER BY NAME_NORMALIZED ASC, NAME ASC, ID ASC
;
