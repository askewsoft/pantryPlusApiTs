-- gets a cohort
SET @cohortId = UUID_TO_BIN(:groupId);

SELECT c.NAME, s.ID_TXT AS ID
FROM COHORT c
JOIN SHOPPER s ON c.OWNER_ID = s.ID
WHERE c.ID = @cohortId
;