SET @categoryIdTxt = :category_id;
SET @categoryNameTxt = :category_name;

UPDATE CATEGORY
SET NAME = @categoryNameTxt
WHERE ID = UUID_TO_BIN(@categoryIdTxt)
;