-- Cohort-scoped typeahead corpus: purchased items (lookBack window) plus items
-- currently on accessible lists. Never scans the full ITEM table.
-- Live ITEM.NAME rows are emitted first (sort_key 0); purchase snapshots and
-- ITEM_ALIAS rows follow (sort_key 1) so clients can treat first-seen as title.
-- Optional @listId resolves categoryId per item for that list.

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @lookBackDays = :lookBackDays;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));
SET @cohortId = :cohortId;
SET @listId = :listId;

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
  SELECT ph.ID AS HISTORY_ID, ph.LIST_ID, ph.PURCHASE_DATE
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
),
itemCategoryOnList AS (
  SELECT
    icr.ITEM_ID,
    icr.CATEGORY_ID,
    COALESCE(MAX(sph.PURCHASE_DATE), DATE('1970-01-01')) AS last_purchase_date
  FROM ITEM_CATEGORY_RELATION icr
  JOIN CATEGORY c ON c.ID = icr.CATEGORY_ID
  LEFT JOIN ITEM_HISTORY_RELATION ihr ON ihr.ITEM_ID = icr.ITEM_ID
  LEFT JOIN shopperPurchaseHistory sph
    ON sph.HISTORY_ID = ihr.PURCHASE_HISTORY_ID
   AND sph.LIST_ID = c.LIST_ID
  WHERE @listId IS NOT NULL
    AND c.LIST_ID = UUID_TO_BIN(@listId)
  GROUP BY icr.ITEM_ID, icr.CATEGORY_ID
),
rankedDirectCategory AS (
  SELECT
    ITEM_ID,
    CATEGORY_ID,
    ROW_NUMBER() OVER (
      PARTITION BY ITEM_ID
      ORDER BY last_purchase_date DESC, CATEGORY_ID
    ) AS rn
  FROM itemCategoryOnList
),
directCategoryHint AS (
  SELECT ITEM_ID, CATEGORY_ID
  FROM rankedDirectCategory
  WHERE rn = 1
),
latestPurchaseCategory AS (
  SELECT
    ihr.ITEM_ID,
    ihr.CATEGORY_NAME,
    ROW_NUMBER() OVER (
      PARTITION BY ihr.ITEM_ID
      ORDER BY sph.PURCHASE_DATE DESC, sph.HISTORY_ID DESC
    ) AS rn
  FROM ITEM_HISTORY_RELATION ihr
  JOIN shopperPurchaseHistory sph ON sph.HISTORY_ID = ihr.PURCHASE_HISTORY_ID
  WHERE @listId IS NOT NULL
    AND ihr.CATEGORY_NAME IS NOT NULL
),
purchaseNameCategoryHint AS (
  SELECT
    lpc.ITEM_ID,
    c.ID AS CATEGORY_ID
  FROM latestPurchaseCategory lpc
  JOIN CATEGORY c
    ON c.LIST_ID = UUID_TO_BIN(@listId)
   AND c.NAME = lpc.CATEGORY_NAME
  LEFT JOIN directCategoryHint dch ON dch.ITEM_ID = lpc.ITEM_ID
  WHERE lpc.rn = 1
    AND dch.ITEM_ID IS NULL
),
itemCategoryHint AS (
  SELECT ITEM_ID, CATEGORY_ID FROM directCategoryHint
  UNION
  SELECT ITEM_ID, CATEGORY_ID FROM purchaseNameCategoryHint
)

SELECT
  BIN_TO_UUID(oc.ITEM_ID) AS id,
  oc.NAME AS name,
  oc.UPC AS upc,
  BIN_TO_UUID(ich.CATEGORY_ID) AS categoryId
FROM orderedCorpus oc
LEFT JOIN itemCategoryHint ich ON ich.ITEM_ID = oc.ITEM_ID
ORDER BY oc.sort_key, oc.ITEM_ID
;
