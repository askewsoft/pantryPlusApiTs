-- updates a shopping list and returns the list_id

SET @listId = :listId;
SET @cohortId = :groupId;
SET @ownerId = :ownerId;
SET @name = :name;

SET @origName = (SELECT NAME FROM LIST WHERE ID_TXT = @listId);
SET @name = (SELECT COALESCE(@name, @origName));

SET @origCohortId = (SELECT COHORT_ID FROM LIST WHERE ID_TXT = @listId);
SET @cohortId = (SELECT COALESCE(@cohortId, @origCohortId));

SET @origOwnerId = (SELECT OWNER_ID FROM LIST WHERE ID_TXT = @listId);
SET @ownerId = (SELECT COALESCE(@ownerId, @origOwnerId));

UPDATE LIST
SET NAME = @name, OWNER_ID = @ownerId, COHORT_ID = @cohortId
WHERE ID_TXT = @listId
;

SELECT ID_TXT as ID
FROM LIST
WHERE ID_TXT = @listId
;
