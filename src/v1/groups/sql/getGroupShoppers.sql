-- gets shoppers in a cohort
SET @cohortIdTxt = :groupId;
SET @cohortId = (SELECT ID FROM COHORT WHERE ID_TXT = @cohortIdTxt);

SELECT s.ID_TXT AS ID, s.NICKNAME, s.EMAIL
FROM COHORT_SHOPPER_RELATION csr
JOIN SHOPPER s ON csr.SHOPPER_ID = s.ID
WHERE csr.COHORT_ID = @cohortId
;
