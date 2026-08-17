-- 1 if this ITEM is on a list outside the current list's cohort (or any other list when the current list has no cohort)
SET @itemId = UUID_TO_BIN(:itemId);
SET @listId = UUID_TO_BIN(:listId);

SELECT COHORT_ID INTO @cohortId
FROM LIST
WHERE ID = @listId
;

SELECT 1 AS usedElsewhere
FROM LIST_ITEM_RELATION lir
JOIN LIST l ON l.ID = lir.LIST_ID
WHERE lir.ITEM_ID = @itemId
  AND lir.LIST_ID <> @listId
  AND (
    @cohortId IS NULL
    OR l.COHORT_ID IS NULL
    OR l.COHORT_ID <> @cohortId
  )
LIMIT 1
;
