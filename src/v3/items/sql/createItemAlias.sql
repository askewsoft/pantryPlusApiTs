SET @itemId = UUID_TO_BIN(:itemId);
SET @aliasName = :aliasName;
SET @aliasNormalized = :aliasNormalized;

INSERT INTO ITEM_ALIAS (ALIAS_NORMALIZED, ITEM_ID, ALIAS_NAME)
VALUES (@aliasNormalized, @itemId, @aliasName)
;
