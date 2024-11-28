-- gets all the lists for the shopper ID
-- associated with the user

SET @shopperIdTxt = :shopperId;

WITH shopperGroups as (
  SELECT gr.ID as GROUP_ID
  FROM PANTRY_PLUS.GROUP_SHOPPER_RELATION gsr
  JOIN PANTRY_PLUS.SHOPPER sh
    ON sh.ID = gsr.SHOPPER_ID
    AND sh.ID = uuid_to_bin(@shopperIdTxt)
  JOIN PANTRY_PLUS.GROUP gr
    ON gr.ID = gsr.GROUP_ID
    AND gr.OWNER_ID <> uuid_to_bin(@shopperIdTxt)
)

SELECT
  bin_to_uuid(ls.ID) as ID,
  ls.NAME,
  bin_to_uuid(ls.OWNER_ID) as OWNER_ID
FROM shopperGroups sg
JOIN PANTRY_PLUS.LIST ls ON ls.GROUP_ID = sg.GROUP_ID
UNION
SELECT
  bin_to_uuid(ID) as ID,
  NAME,
  bin_to_uuid(OWNER_ID) as OWNER_ID
FROM PANTRY_PLUS.LIST
WHERE OWNER_ID = uuid_to_bin(@shopperIdTxt)
;