-- confirm access to alter cohort
-- cohorts may be changed or deleted by owner only

SET @userEmail = :email;
SET @cohortIdTxt = :id;

SELECT ID INTO @cohortId FROM COHORT WHERE ID_TXT = @cohortIdTxt
;
SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM COHORT c
WHERE c.OWNER_ID = @shopperId
  AND c.ID = @cohortId
;