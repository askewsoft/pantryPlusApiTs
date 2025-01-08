SET @shopperEmail = :shopperEmail;
SET @cohortId = UUID_TO_BIN(:groupId);

INSERT IGNORE INTO INVITEES (EMAIL, COHORT_ID)
VALUES (@shopperEmail, @cohortId)
;