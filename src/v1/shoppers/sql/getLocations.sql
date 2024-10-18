-- gets all the locations for the shopper ID
-- associated with the user

SET @shopperId = :shopperId;
SET @lookBackDays = 365;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));

; WITH shopperGroups as (
  SELECT gr.ID as GROUP_ID
  FROM PANTRY_PLUS.GROUP_SHOPPER_RELATION gsr
  JOIN PANTRY_PLUS.GROUP gr ON gr.ID = gsr.GROUP_ID
  WHERE gsr.SHOPPER_ID = @shopperId
),
shopperLists as (
  SELECT ls.ID as LIST_ID
  FROM PANTRY_PLUS.LIST ls
  JOIN shopperGroups sg ON sg.GROUP_ID = ls.GROUP_ID
)

SELECT DISTINCT
  lo.ID_TXT as ID,
  lo.NAME,
  lo.GEOHASH
FROM shopperLists sl
JOIN PANTRY_PLUS.PURCHASE_HISTORY ph ON ph.LIST_ID = sl.LIST_ID
JOIN PANTRY_PLUS.LOCATION lo ON lo.ID = ph.LOCATION_ID
WHERE ph.PURCHASE_DATE >= @lookBackDate
;
