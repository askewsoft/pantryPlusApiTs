-- deletes a cohort
SET @cohortId = UUID_TO_BIN(:groupId);

DELETE FROM COHORT_SHOPPER_RELATION
WHERE COHORT_ID = @cohortId
;

UPDATE LIST
SET COHORT_ID = NULL
WHERE COHORT_ID = @cohortId
;

DELETE FROM COHORT
WHERE ID = @cohortId
;
