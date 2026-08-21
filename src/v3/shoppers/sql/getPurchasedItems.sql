-- Cohort-scoped typeahead corpus: purchased items (lookBack window) plus items
-- currently on accessible lists. Never scans the full ITEM table.
-- Live ITEM.NAME rows are emitted first (sort_key 0); purchase snapshots and
-- ITEM_ALIAS rows follow (sort_key 1) so clients can treat first-seen as title.

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @lookBackDays = :lookBackDays;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));
SET @cohortId = :cohortId;

WITH shopperCohorts AS (
  SELECT c.ID AS COHORT_ID
  FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
  JOIN PANTRY_PLUS.COHORT c ON c.ID = csr.COHORT_ID
  WHERE csr.SHOPPER_ID = @shopperId
  UNION
  SELECT c.ID AS COHORT_ID
  FROM PANTRY_PLUS.COHORT c
  WHERE c.OWNER_ID = @shopperId
),
shopperLists AS (
  SELECT ls.ID AS LIST_ID
  FROM PANTRY_PLUS.LIST ls
  JOIN shopperCohorts sc ON sc.COHORT_ID = ls.COHORT_ID
  WHERE @cohortId IS NULL OR ls.COHORT_ID = UUID_TO_BIN(@cohortId)
  UNION
  SELECT ls.ID AS LIST_ID
  FROM PANTRY_PLUS.LIST ls
  WHERE ls.OWNER_ID = @shopperId
    AND ls.COHORT_ID IS NULL
    AND @cohortId IS NULL
),
shopperPurchaseHistory AS (
  SELECT ph.ID AS HISTORY_ID
  FROM PANTRY_PLUS.PURCHASE_HISTORY ph
  JOIN shopperLists sl ON sl.LIST_ID = ph.LIST_ID
  WHERE ph.PURCHASE_DATE >= @lookBackDate
),
purchasedItems AS (
  SELECT DISTINCT
    it.ID AS ITEM_ID,
    it.NAME AS NAME,
    it.UPC AS UPC
  FROM shopperPurchaseHistory sph
  JOIN PANTRY_PLUS.ITEM_HISTORY_RELATION ihr ON ihr.PURCHASE_HISTORY_ID = sph.HISTORY_ID
  JOIN PANTRY_PLUS.ITEM it ON it.ID = ihr.ITEM_ID
),
listItems AS (
  SELECT DISTINCT
    it.ID AS ITEM_ID,
    it.NAME AS NAME,
    it.UPC AS UPC
  FROM shopperLists sl
  JOIN PANTRY_PLUS.LIST_ITEM_RELATION lir ON lir.LIST_ID = sl.LIST_ID
  JOIN PANTRY_PLUS.ITEM it ON it.ID = lir.ITEM_ID
),
corpus AS (
  SELECT ITEM_ID, NAME, UPC FROM purchasedItems
  UNION
  SELECT ITEM_ID, NAME, UPC FROM listItems
),
historicalNames AS (
  SELECT DISTINCT
    it.ID AS ITEM_ID,
    ihr.ITEM_NAME AS NAME,
    it.UPC AS UPC
  FROM shopperPurchaseHistory sph
  JOIN PANTRY_PLUS.ITEM_HISTORY_RELATION ihr ON ihr.PURCHASE_HISTORY_ID = sph.HISTORY_ID
  JOIN PANTRY_PLUS.ITEM it ON it.ID = ihr.ITEM_ID
  WHERE ihr.ITEM_NAME IS NOT NULL
    AND LOWER(TRIM(ihr.ITEM_NAME)) <> LOWER(TRIM(it.NAME))
),
orderedCorpus AS (
  SELECT ITEM_ID, NAME, UPC, 0 AS sort_key FROM corpus
  UNION ALL
  SELECT ITEM_ID, NAME, UPC, 1 AS sort_key FROM historicalNames
  UNION ALL
  SELECT ia.ITEM_ID, ia.ALIAS_NAME AS NAME, c.UPC AS UPC, 1 AS sort_key
  FROM ITEM_ALIAS ia
  INNER JOIN corpus c ON c.ITEM_ID = ia.ITEM_ID
)

SELECT
  BIN_TO_UUID(ITEM_ID) AS id,
  NAME AS name,
  UPC AS upc
FROM orderedCorpus
ORDER BY sort_key, id
;
