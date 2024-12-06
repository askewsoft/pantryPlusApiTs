-- adds a shopper to a cohort of shoppers and returns its shopper_id

SET @shopperIdTxt = :shopperId;
SET @cohortIdTxt = :groupId;

SET @cohortId = (SELECT ID FROM COHORT WHERE ID_TXT = @cohortIdTxt);
SET @shopperId = (SELECT ID FROM SHOPPER WHERE ID_TXT = @shopperIdTxt);

INSERT INTO COHORT_SHOPPER_RELATION (COHORT_ID, SHOPPER_ID)
VALUES (@cohortId, @shopperId)
;