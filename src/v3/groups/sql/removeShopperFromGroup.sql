-- removes a shopper from a cohort
SET @cohortId = UUID_TO_BIN(:groupId);
SET @shopperId = UUID_TO_BIN(:shopperId);

DELETE FROM COHORT_SHOPPER_RELATION
WHERE COHORT_ID = @cohortId
    AND SHOPPER_ID = @shopperId
;