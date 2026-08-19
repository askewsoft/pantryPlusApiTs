-- confirm access to alter cohort
-- cohorts may be changed or deleted by owner only

SET @userEmail = :email;
SET @cohortId = UUID_TO_BIN(:id);

SELECT ID INTO @shopperId FROM SHOPPER WHERE EMAIL = @userEmail
;

SELECT 1 AS ALLOWED
FROM COHORT c
WHERE c.OWNER_ID = @shopperId
  AND c.ID = @cohortId
;