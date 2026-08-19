-- Known locations for a shopper:
-- 1) locations they created (CREATED_BY)
-- 2) locations created by shoppers who share any cohort with them
-- 3) locations from purchase history on accessible lists within lookBackDays

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @lookBackDays = :lookBackDays;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));

WITH shopperCohorts as (
  SELECT c.ID as COHORT_ID
  FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
  JOIN PANTRY_PLUS.COHORT c ON c.ID = csr.COHORT_ID
  WHERE csr.SHOPPER_ID = @shopperId
  UNION
  SELECT c.ID as COHORT_ID
  FROM PANTRY_PLUS.COHORT c
  WHERE c.OWNER_ID = @shopperId
),
cohortMates as (
  SELECT csr.SHOPPER_ID as SHOPPER_ID
  FROM PANTRY_PLUS.COHORT_SHOPPER_RELATION csr
  JOIN shopperCohorts sc ON sc.COHORT_ID = csr.COHORT_ID
  WHERE csr.SHOPPER_ID <> @shopperId
  UNION
  SELECT c.OWNER_ID as SHOPPER_ID
  FROM PANTRY_PLUS.COHORT c
  JOIN shopperCohorts sc ON sc.COHORT_ID = c.ID
  WHERE c.OWNER_ID <> @shopperId
),
shopperLists as (
  SELECT ls.ID as LIST_ID
  FROM PANTRY_PLUS.LIST ls
  JOIN shopperCohorts sc ON sc.COHORT_ID = ls.COHORT_ID
  UNION
  SELECT ID as LIST_ID
  FROM PANTRY_PLUS.LIST
  WHERE OWNER_ID = @shopperId
),
createdKnown as (
  SELECT lo.ID, lo.NAME, lo.GEO_LOCATION, CAST(NULL AS DATE) as last_purchase_date
  FROM PANTRY_PLUS.LOCATION lo
  WHERE lo.CREATED_BY = @shopperId
  UNION
  SELECT lo.ID, lo.NAME, lo.GEO_LOCATION, CAST(NULL AS DATE) as last_purchase_date
  FROM PANTRY_PLUS.LOCATION lo
  JOIN cohortMates cm ON cm.SHOPPER_ID = lo.CREATED_BY
),
purchasedKnown as (
  SELECT lo.ID, lo.NAME, lo.GEO_LOCATION, MAX(ph.PURCHASE_DATE) as last_purchase_date
  FROM shopperLists sl
  JOIN PANTRY_PLUS.PURCHASE_HISTORY ph ON ph.LIST_ID = sl.LIST_ID
  JOIN PANTRY_PLUS.LOCATION lo ON lo.ID = ph.LOCATION_ID
  WHERE ph.PURCHASE_DATE >= @lookBackDate
  GROUP BY lo.ID, lo.NAME, lo.GEO_LOCATION
),
allKnown as (
  SELECT ID, NAME, GEO_LOCATION, last_purchase_date FROM createdKnown
  UNION ALL
  SELECT ID, NAME, GEO_LOCATION, last_purchase_date FROM purchasedKnown
)
SELECT
  BIN_TO_UUID(ak.ID) as id,
  ak.NAME as name,
  ST_Latitude(ak.GEO_LOCATION) as latitude,
  ST_Longitude(ak.GEO_LOCATION) as longitude,
  MAX(ak.last_purchase_date) as last_purchase_date
FROM allKnown ak
GROUP BY ak.ID, ak.NAME, ak.GEO_LOCATION
ORDER BY (MAX(ak.last_purchase_date) IS NULL), MAX(ak.last_purchase_date) DESC
;
