-- gets all the lists for the shopper ID
-- associated with the user

SET @shopperId = :shopperId;

; WITH shopperGroups as (
  SELECT gr.ID as GROUP_ID, gr
  FROM GROUP_SHOPPER_RELATION gsr
  JOIN SHOPPER sh
    ON sh.ID = gsr.SHOPPER_ID
    AND sh.ID_TXT = @shopperId
  JOIN GROUP gr ON gr.ID = gsr.GROUP_ID
)

SELECT
  ls.ID_TXT as ID,
  NAME,
  CASE
    WHEN sh.ID_TXT = @shopperId THEN TRUE
    ELSE FALSE
  END AS IS_LIST_OWNER
FROM shopperGroups sg
JOIN LIST ls ON ls.GROUP_ID = sg.GROUP_ID
LEFT JOIN SHOPPER sh ON sh.ID = ls.OWNER_ID
;
