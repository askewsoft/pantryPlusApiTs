-- gets all the locations for the shopper ID
-- associated with the user

SET @shopperId = :shopperId;
SET @lookBackDays = 365;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));

; WITH shopperGroups as (
  SELECT gr.ID as GROUP_ID
  FROM GROUP_SHOPPER_RELATION gsr
  JOIN GROUP gr ON gr.ID = gsr.GROUP_ID
  WHERE gsr.SHOPPER_ID = @shopperId
),
shopperLists as (
  SELECT ls.ID as LIST_ID
  FROM LIST ls
  JOIN shopperGroups sg ON sg.GROUP_ID = ls.GROUP_ID
)

SELECT DISTINCT
  lo.ID_TXT as ID,
  lo.NAME,
  lo.GEOHASH
FROM shopperLists sl
JOIN PURCHASE_HISTORY ph ON ph.LIST_ID = sl.LIST_ID
JOIN LOCATION lo ON lo.ID = ph.LOCATION_ID
WHERE ph.PURCHASE_DATE >= @lookBackDate
;
