SET @itemId = UUID_TO_BIN(COALESCE(:itemId, :id));
SET @name = :name;
SET @nameNormalized = LOWER(TRIM(:name));

UPDATE ITEM
SET NAME = @name,
    NAME_NORMALIZED = @nameNormalized
WHERE ID = @itemId
;