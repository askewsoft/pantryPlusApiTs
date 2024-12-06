SET @name = :name;
SET @cohortIdTxt = :cohortId;

SET @cohortId = (SELECT ID FROM COHORT WHERE ID_TXT = @cohortIdTxt);

UPDATE COHORT
SET NAME = @name
WHERE ID = @cohortId
;