-- Cohort-scoped typeahead corpus: purchased items (lookBack window) plus items
-- currently on accessible lists. Never scans the full ITEM table.

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
    COALESCE(ihr.ITEM_NAME, it.NAME) AS NAME,
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
corpusWithAliases AS (
  SELECT ITEM_ID, NAME, UPC FROM corpus
  UNION
  SELECT ia.ITEM_ID, ia.ALIAS_NAME AS NAME, c.UPC AS UPC
  FROM ITEM_ALIAS ia
  INNER JOIN corpus c ON c.ITEM_ID = ia.ITEM_ID
)

SELECT
  BIN_TO_UUID(ITEM_ID) AS id,
  NAME AS name,
  UPC AS upc
FROM corpusWithAliases
;
