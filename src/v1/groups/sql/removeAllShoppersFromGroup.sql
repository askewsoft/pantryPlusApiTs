-- removes all shoppers from a cohort
SET @cohortIdTxt = :groupId;

SET @cohortId = (SELECT ID FROM COHORT WHERE ID_TXT = @cohortIdTxt);

DELETE FROM COHORT_SHOPPER_RELATION
WHERE COHORT_ID = @cohortId
;
