-- gets all the items for the shopper ID
-- associated with the user

SET @shopperIdTxt = :shopperId;
SET @lookBackDays = 365;
SET @lookBackDate = (SELECT ADDDATE(CURDATE(), -@lookBackDays));

SET @shopperId = (SELECT ID FROM PANTRY_PLUS.SHOPPER WHERE ID_TXT = @shopperIdTxt);

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
),
shopperPurchaseHistory as (
  SELECT ph.ID as HISTORY_ID
  from PANTRY_PLUS.PURCHASE_HISTORY ph
  JOIN shopperLists sl ON sl.LIST_ID = ph.LIST_ID
  WHERE ph.PURCHASE_DATE >= @lookBackDate
)

SELECT DISTINCT
  it.ID_TXT as ID,
  it.NAME,
  it.UPC
FROM shopperPurchaseHistory sph
JOIN PANTRY_PLUS.ITEM_HISTORY_RELATION ihr ON ihr.HISTORY_ID = sph.HISTORY_ID
JOIN PANTRY_PLUS.ITEM it ON it.ID = ihr.ITEM_ID
;