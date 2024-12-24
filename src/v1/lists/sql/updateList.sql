SET @listId = UUID_TO_BIN(:listId);
SET @cohortId = UUID_TO_BIN(:groupId);
SET @shopperId = UUID_TO_BIN(:shopperId);
SET @listOrdinal = :listOrdinal;
SET @listName = :listName;

UPDATE LIST
SET NAME = @listName, COHORT_ID = @cohortId
WHERE ID = @listId
;

INSERT INTO LIST_ORDER (LIST_ID, SHOPPER_ID, ORDINAL)
VALUES (@listId, @shopperId, CAST(@listOrdinal as UNSIGNED))
ON DUPLICATE KEY UPDATE
    ORDINAL = CAST(@listOrdinal as UNSIGNED)
;