-- removes an invite from a cohort
SET @cohortId = UUID_TO_BIN(:groupId);
SET @shopperEmail = :shopperEmail;

DELETE FROM INVITEES
WHERE EMAIL = @shopperEmail
    AND COHORT_ID = @cohortId
;