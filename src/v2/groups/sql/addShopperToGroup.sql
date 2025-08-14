SET @shopperId = UUID_TO_BIN(:shopperId);
SET @cohortId = UUID_TO_BIN(:groupId);

INSERT IGNORE INTO COHORT_SHOPPER_RELATION (COHORT_ID, SHOPPER_ID)
VALUES (@cohortId, @shopperId)
;