-- gets all the groups for the shopper ID
-- associated with the user

SET @shopperIdTxt = :shopperId;

SELECT
  gr.ID_TXT,
  gr.NAME,
  CAST(gr.OWNER_ID = sh.ID AS UNSIGNED) AS IS_OWNER
FROM SHOPPER sh
JOIN GROUP_SHOPPER_RELATION gsr ON gsr.SHOPPER_ID = sh.ID
JOIN GROUP gr ON gr.ID = gsr.GROUP_ID
WHERE sh.SHOPPER_ID_TXT = @shopperIdTxt
;
