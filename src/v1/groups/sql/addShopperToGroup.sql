-- adds a shopper to a cohort of shoppers and returns its shopper_id

SET @shopperId = UUID_TO_BIN(:shopperId);
SET @cohortId = UUID_TO_BIN(:groupId);

INSERT INTO COHORT_SHOPPER_RELATION (COHORT_ID, SHOPPER_ID)
VALUES (@cohortId, @shopperId)
;