SET @categoryIdTxt = :categoryId;
SET @listIdTxt = :listId;

SELECT
  bin_to_uuid(id) AS id,
  name,
  upc
FROM ITEM
JOIN ITEM_CATEGORY_RELATION icr
    ON icr.item_id = id
JOIN LIST_ITEM_RELATION lir 
    ON lir.item_id = id
WHERE icr.category_id = uuid_to_bin(@categoryIdTxt)
  AND lir.list_id = uuid_to_bin(@listIdTxt)
;