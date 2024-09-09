-- gets all the items for the shopper ID
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
),
shopperPurchaseHistory as (
  SELECT ph.ID as HISTORY_ID
  from PURCHASE_HISTORY ph
  JOIN shopperLists sl ON sl.LIST_ID = ph.LIST_ID
  WHERE ph.PURCHASE_DATE >= @lookBackDate
)

SELECT DISTINCT
  it.ID_TXT as ID,
  it.NAME,
  it.UPC
FROM shopperPurchaseHistory sph
JOIN ITEM_HISTORY_RELATION ihr ON ihr.HISTORY_ID = sph.HISTORY_ID
JOIN ITEM it ON it.ID = ihr.ITEM_ID
;
