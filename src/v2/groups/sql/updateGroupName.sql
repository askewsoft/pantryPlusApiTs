SET @name = :name;
SET @cohortId = UUID_TO_BIN(:groupId);

UPDATE COHORT
SET NAME = @name
WHERE ID = @cohortId
;