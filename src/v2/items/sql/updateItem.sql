SET @itemId = UUID_TO_BIN(:itemId);
SET @itemName = :name;

UPDATE ITEM
SET NAME = @itemName
WHERE ID = @itemId
; 