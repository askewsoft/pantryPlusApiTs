-- gets all the locations for the shopper ID
-- associated with the user
-- that have been purchased in the last X days

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
shopperLists as (
  SELECT ls.ID as LIST_ID
  FROM PANTRY_PLUS.LIST ls
  JOIN shopperCohorts sc ON sc.COHORT_ID = ls.COHORT_ID
)
SELECT
  BIN_TO_UUID(lo.ID) as id,
  lo.NAME as name,
  ST_Latitude(lo.GEO_LOCATION) as latitude,
  ST_Longitude(lo.GEO_LOCATION) as longitude,
  MAX(ph.PURCHASE_DATE) as last_purchase_date
FROM shopperLists sl
JOIN PANTRY_PLUS.PURCHASE_HISTORY ph ON ph.LIST_ID = sl.LIST_ID
JOIN PANTRY_PLUS.LOCATION lo ON lo.ID = ph.LOCATION_ID
WHERE ph.PURCHASE_DATE >= @lookBackDate
GROUP BY lo.ID, lo.NAME, lo.GEO_LOCATION
ORDER BY last_purchase_date DESC
;