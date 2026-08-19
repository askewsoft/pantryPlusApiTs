SET @itemId = UUID_TO_BIN(:itemId);
SET @aliasNormalized = :aliasNormalized;

DELETE FROM ITEM_ALIAS
WHERE ITEM_ID = @itemId
  AND ALIAS_NORMALIZED = @aliasNormalized
;
