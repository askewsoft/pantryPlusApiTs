-- gets invitees for a cohort
SET @cohortId = UUID_TO_BIN(:groupId);

SELECT EMAIL
FROM INVITEES
WHERE COHORT_ID = @cohortId
;