-- confirm access to view cohort
-- cohorts may be viewed by any member or owner

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
UNION
SELECT 1 AS ALLOWED
FROM COHORT_SHOPPER_RELATION csr
WHERE csr.SHOPPER_ID = @shopperId
  AND csr.COHORT_ID = @cohortId
;