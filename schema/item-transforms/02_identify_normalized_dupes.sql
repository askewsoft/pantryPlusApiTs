-- Identify exact / case-only dupes: same NAME_NORMALIZED, more than one row
SELECT
  NAME_NORMALIZED AS name_normalized,
  COUNT(*) AS item_count,
  GROUP_CONCAT(NAME ORDER BY NAME SEPARATOR ' | ') AS display_names,
  GROUP_CONCAT(BIN_TO_UUID(ID) ORDER BY NAME SEPARATOR ' | ') AS item_ids
FROM ITEM
WHERE NAME_NORMALIZED IS NOT NULL
  AND NAME_NORMALIZED <> ''
GROUP BY NAME_NORMALIZED
HAVING COUNT(*) > 1
ORDER BY item_count DESC, name_normalized ASC
;
