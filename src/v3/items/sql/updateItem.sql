SET @itemId = UUID_TO_BIN(:itemId);
SET @name = :name;
SET @nameNormalized = :nameNormalized;

UPDATE ITEM
SET NAME = @name,
    NAME_NORMALIZED = @nameNormalized
WHERE ID = @itemId
;