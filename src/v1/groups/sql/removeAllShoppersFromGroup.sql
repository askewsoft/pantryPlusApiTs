-- removes all shoppers from a cohort
SET @cohortId = UUID_TO_BIN(:groupId);

DELETE FROM COHORT_SHOPPER_RELATION
WHERE COHORT_ID = @cohortId
;
