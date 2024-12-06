-- gets all the cohorts for the shopper ID
-- associated with the user

SET @shopperIdTxt = :shopperId;

SELECT
  c.ID_TXT,
  c.NAME,
  CAST(c.OWNER_ID = sh.ID AS UNSIGNED) AS IS_OWNER
FROM PANTRY_PLUS.SHOPPER sh
JOIN PANTRY_PLUS.COHORT_SHOPPER_RELATION csr ON csr.SHOPPER_ID = sh.ID
JOIN PANTRY_PLUS.COHORT c ON c.ID = csr.COHORT_ID
WHERE sh.SHOPPER_ID_TXT = @shopperIdTxt
;
