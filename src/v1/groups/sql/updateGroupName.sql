SET @name = :name;
SET @cohortId = UUID_TO_BIN(:cohortId);

UPDATE COHORT
SET NAME = @name
WHERE ID = @cohortId
;