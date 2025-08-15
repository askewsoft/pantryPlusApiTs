-- gets all the items for the shopper ID
-- associated with the user

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @lookBackDays = 365;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));

; WITH shopperCohorts as (
  SELECT c.ID as COHORT_ID
  FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
  JOIN PANTRY_PLUS.COHORT c ON c.ID = csr.COHORT_ID
  WHERE csr.SHOPPER_ID = @shopperId
),
shopperLists as (
  SELECT ls.ID as LIST_ID
  FROM PANTRY_PLUS.LIST ls
  JOIN shopperCohorts sc ON sc.COHORT_ID = ls.COHORT_ID
),
shopperPurchaseHistory as (
  SELECT ph.ID as HISTORY_ID
  from PANTRY_PLUS.PURCHASE_HISTORY ph
  JOIN shopperLists sl ON sl.LIST_ID = ph.LIST_ID
  WHERE ph.PURCHASE_DATE >= @lookBackDate
)

SELECT DISTINCT
  BIN_TO_UUID(it.ID) as ID,
  it.NAME,
  it.UPC
FROM shopperPurchaseHistory sph
JOIN PANTRY_PLUS.ITEM_HISTORY_RELATION ihr ON ihr.HISTORY_ID = sph.HISTORY_ID
JOIN PANTRY_PLUS.ITEM it ON it.ID = ihr.ITEM_ID
;