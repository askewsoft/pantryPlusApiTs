-- gets shoppers in a cohort
SET @cohortId = UUID_TO_BIN(:groupId);

SELECT BIN_TO_UUID(s.ID) AS ID, s.NICKNAME, s.EMAIL
FROM COHORT_SHOPPER_RELATION csr
JOIN SHOPPER s ON csr.SHOPPER_ID = s.ID
WHERE csr.COHORT_ID = @cohortId
;