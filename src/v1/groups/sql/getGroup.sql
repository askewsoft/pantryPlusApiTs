-- gets a cohort
SET @cohortIdTxt = :groupId;
SET @cohortId = (SELECT ID FROM COHORT WHERE ID_TXT = @cohortIdTxt);

SELECT c.NAME, s.ID_TXT AS ID
FROM COHORT c
JOIN SHOPPER s ON c.OWNER_ID = s.ID
WHERE c.ID = @cohortId
;