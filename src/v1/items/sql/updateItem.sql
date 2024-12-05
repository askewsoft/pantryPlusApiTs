SET @itemIdTxt = :item_id;
SET @itemName = :name;

UPDATE ITEM
SET NAME = @itemName
WHERE ID_TXT = UUID_TO_BIN(@itemIdTxt)
; 