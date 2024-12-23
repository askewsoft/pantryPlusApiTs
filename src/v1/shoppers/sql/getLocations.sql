-- gets all the locations for the shopper ID
-- associated with the user

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @lookBackDays = 365;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));

; WITH shopperCohorts as (
  SELECT BIN_TO_UUID(c.ID) as COHORT_ID
  FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
  JOIN PANTRY_PLUS.COHORT c ON c.ID = csr.COHORT_ID
  WHERE csr.SHOPPER_ID = @shopperId
),
shopperLists as (
  SELECT BIN_TO_UUID(ls.ID) as LIST_ID
  FROM PANTRY_PLUS.LIST ls
  JOIN shopperCohorts sc ON sc.COHORT_ID = ls.COHORT_ID
)

SELECT DISTINCT
  BIN_TO_UUID(lo.ID) as ID,
  lo.NAME,
  lo.GEOHASH
FROM shopperLists sl
JOIN PANTRY_PLUS.PURCHASE_HISTORY ph ON ph.LIST_ID = sl.LIST_ID
JOIN PANTRY_PLUS.LOCATION lo ON lo.ID = ph.LOCATION_ID
WHERE ph.PURCHASE_DATE >= @lookBackDate
;
